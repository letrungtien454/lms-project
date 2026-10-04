package lms_backend_core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lms_backend_core.dto.ProgressResponse;
import lms_backend_core.dto.ProgressUpdateRequest;
import lms_backend_core.dto.QuizDtos;
import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LearningFlowService {

    private static final ObjectMapper OPTION_MAPPER = new ObjectMapper();

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LearningProgressRepository progressRepository;
    private final LessonAttachmentRepository attachmentRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<ProgressResponse> getProgress(Long courseId, Authentication authentication) {
        User student = getStudent(authentication);
        return progressRepository.findAllByStudentIdAndLessonChapterCourseId(student.getId(), courseId)
                .stream().map(ProgressResponse::from).toList();
    }

    @Transactional
    public ProgressResponse updateProgress(
            Long lessonId,
            ProgressUpdateRequest request,
            Authentication authentication) {
        User student = getStudent(authentication);
        Lesson lesson = getAccessibleLesson(lessonId, authentication);
        int playbackTime = request.lastPlaybackTime() == null ? 0 : request.lastPlaybackTime();
        if (lesson.getDurationSeconds() != null && lesson.getDurationSeconds() > 0
                && playbackTime > lesson.getDurationSeconds() + 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Playback time exceeds lesson duration.");
        }

        LearningProgress progress = progressRepository.findByStudentIdAndLessonId(student.getId(), lessonId)
                .orElseGet(() -> {
                    LearningProgress created = new LearningProgress();
                    created.setStudent(student);
                    created.setLesson(lesson);
                    created.setStatus(LearningProgress.Status.NOT_STARTED);
                    created.setLastPlaybackTime(0);
                    return created;
                });

        progress.setLastPlaybackTime(playbackTime);
        if (Boolean.TRUE.equals(request.completed())) {
            progress.setStatus(LearningProgress.Status.COMPLETED);
        } else if (progress.getStatus() != LearningProgress.Status.COMPLETED) {
            progress.setStatus(playbackTime > 0
                    ? LearningProgress.Status.IN_PROGRESS
                    : LearningProgress.Status.NOT_STARTED);
        }
        return ProgressResponse.from(progressRepository.save(progress));
    }

    @Transactional(readOnly = true)
    public List<lms_backend_core.dto.AttachmentResponse> getAttachments(
            Long lessonId,
            Authentication authentication) {
        getAccessibleLesson(lessonId, authentication);
        return attachmentRepository.findAllByLessonIdOrderByIdAsc(lessonId)
                .stream().map(lms_backend_core.dto.AttachmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Optional<QuizDtos.Quiz> getQuiz(Long lessonId, Authentication authentication) {
        getAccessibleLesson(lessonId, authentication);
        return quizRepository.findByLessonId(lessonId)
                .map(quiz -> new QuizDtos.Quiz(
                        quiz.getId(),
                        quiz.getTitle(),
                        quiz.getTimeLimitMinutes(),
                        quiz.getPassScore(),
                        quiz.getQuestions().stream().map(this::toQuizQuestion).toList()));
    }

    @Transactional
    public QuizDtos.Result submitQuiz(
            Long lessonId,
            QuizDtos.Submission submission,
            Authentication authentication) {
        User student = getStudent(authentication);
        getAccessibleLesson(lessonId, authentication);
        Quiz quiz = quizRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found."));
        if (submission.answers() == null || submission.answers().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one answer.");
        }

        List<QuestionBank> questions = quiz.getQuestions();
        if (!submission.answers().keySet().stream().allMatch(id ->
                questions.stream().anyMatch(question -> question.getId().equals(id)))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission contains a question outside this quiz.");
        }

        List<QuizDtos.AnswerResult> answers = new ArrayList<>();
        long correctCount = 0;
        for (QuestionBank question : questions) {
            String selected = submission.answers().get(question.getId());
            boolean correct = question.getCorrectOption().equals(selected);
            if (correct) correctCount++;
            answers.add(new QuizDtos.AnswerResult(
                    question.getId(), selected, question.getCorrectOption(), question.getExplanation()));
        }

        double score = questions.isEmpty() ? 0
                : BigDecimal.valueOf(correctCount * 100.0 / questions.size())
                        .setScale(2, RoundingMode.HALF_UP).doubleValue();
        boolean passed = score >= (quiz.getPassScore() == null ? 80 : quiz.getPassScore());

        QuizResult result = new QuizResult();
        result.setStudent(student);
        result.setQuiz(quiz);
        result.setScore(BigDecimal.valueOf(score));
        result.setIsPassed(passed);
        quizResultRepository.save(result);

        return new QuizDtos.Result(quiz.getId(), score, passed, answers);
    }

    @Transactional(readOnly = true)
    public Lesson getAccessibleLesson(Long lessonId, Authentication authentication) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found."));
        if (!Boolean.TRUE.equals(lesson.getChapter().getCourse().getIsPublished())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found.");
        }
        boolean preview = Boolean.TRUE.equals(lesson.getIsPreview());
        if (preview) return lesson;

        User student = getStudentOrNull(authentication);
        if (student == null || !enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(), lesson.getChapter().getCourse().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Enroll in this course to access the lesson.");
        }
        return lesson;
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long courseId, Authentication authentication) {
        User student = getStudentOrNull(authentication);
        return student != null
                && enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId);
    }

    @Transactional(readOnly = true)
    public LessonContext getLessonContext(Long lessonId, Authentication authentication) {
        Lesson lesson = getAccessibleLesson(lessonId, authentication);
        return new LessonContext(
                lesson.getId(),
                lesson.getChapter().getCourse().getId(),
                lesson.getName(),
                lesson.getContent());
    }

    public User getStudent(Authentication authentication) {
        User student = getStudentOrNull(authentication);
        if (student == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        return student;
    }

    private User getStudentOrNull(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private QuizDtos.Question toQuizQuestion(QuestionBank question) {
        if (question.getOptionsJson() == null || !question.getOptionsJson().isArray()) {
            throw new IllegalStateException("Invalid options_json for quiz question " + question.getId());
        }
        List<QuizDtos.Option> options = OPTION_MAPPER.convertValue(
                question.getOptionsJson(),
                OPTION_MAPPER.getTypeFactory().constructCollectionType(List.class, QuizDtos.Option.class));
        return new QuizDtos.Question(question.getId(), question.getQuestionText(), options);
    }

    public record LessonContext(Long lessonId, Long courseId, String name, String content) {
    }
}
