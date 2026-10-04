package lms_backend_core.service;

import com.fasterxml.jackson.databind.JsonNode;
import lms_backend_core.dto.VideoInteractiveQuestionDtos;
import lms_backend_core.entity.LearningProgress;
import lms_backend_core.entity.QuestionBank;
import lms_backend_core.entity.User;
import lms_backend_core.entity.VideoInteractiveQuestion;
import lms_backend_core.entity.VideoInteractiveQuestionAttempt;
import lms_backend_core.repository.LearningProgressRepository;
import lms_backend_core.repository.UserRepository;
import lms_backend_core.repository.VideoInteractiveQuestionAttemptRepository;
import lms_backend_core.repository.VideoInteractiveQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoInteractiveQuestionService {

    private final LearningFlowService learningFlowService;
    private final LearningProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final VideoInteractiveQuestionRepository questionRepository;
    private final VideoInteractiveQuestionAttemptRepository attemptRepository;

    @Transactional(readOnly = true)
    public VideoInteractiveQuestionDtos.LessonQuestions getQuestions(
            Long lessonId,
            Authentication authentication) {
        learningFlowService.getAccessibleLesson(lessonId, authentication);
        User student = findStudent(authentication);
        boolean lessonCompleted = student != null && progressRepository
                .findByStudentIdAndLessonId(student.getId(), lessonId)
                .map(progress -> progress.getStatus() == LearningProgress.Status.COMPLETED)
                .orElse(false);
        List<VideoInteractiveQuestion> lessonQuestions =
                questionRepository.findAllByLessonIdOrderByVideoTimestampAscIdAsc(lessonId);
        boolean answeredAllQuestionsCorrectly = student != null && lessonQuestions.stream()
                .allMatch(question -> attemptRepository.existsByStudentIdAndInteractiveQuestionIdAndIsCorrectTrue(
                        student.getId(), question.getId()));
        boolean reviewMode = lessonCompleted && answeredAllQuestionsCorrectly;
        List<VideoInteractiveQuestionDtos.Question> questions = lessonQuestions.stream()
                .map(interactiveQuestion -> toDto(interactiveQuestion, student))
                .toList();
        return new VideoInteractiveQuestionDtos.LessonQuestions(reviewMode, questions);
    }

    @Transactional
    public VideoInteractiveQuestionDtos.AnswerResult submitAnswer(
            Long lessonId,
            Long interactiveQuestionId,
            VideoInteractiveQuestionDtos.AnswerSubmission submission,
            Authentication authentication) {
        User student = learningFlowService.getStudent(authentication);
        learningFlowService.getAccessibleLesson(lessonId, authentication);

        VideoInteractiveQuestion interactiveQuestion = questionRepository
                .findByIdAndLessonId(interactiveQuestionId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video question not found."));
        QuestionBank question = interactiveQuestion.getQuestion();
        if (!containsOption(question.getOptionsJson(), submission.selectedOption())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected option is not part of this question.");
        }

        boolean correct = question.getCorrectOption().equals(submission.selectedOption());
        VideoInteractiveQuestionAttempt attempt = attemptRepository
                .findByStudentIdAndInteractiveQuestionId(student.getId(), interactiveQuestionId)
                .orElseGet(VideoInteractiveQuestionAttempt::new);
        attempt.setStudent(student);
        attempt.setInteractiveQuestion(interactiveQuestion);
        attempt.setSelectedOption(submission.selectedOption());
        attempt.setIsCorrect(correct);
        attemptRepository.save(attempt);

        return new VideoInteractiveQuestionDtos.AnswerResult(
                correct,
                correct ? question.getCorrectOption() : null,
                question.getExplanation());
    }

    private VideoInteractiveQuestionDtos.Question toDto(
            VideoInteractiveQuestion interactiveQuestion,
            User student) {
        QuestionBank question = interactiveQuestion.getQuestion();
        if (question.getOptionsJson() == null || !question.getOptionsJson().isArray()) {
            throw new IllegalStateException("Invalid options_json for video question " + question.getId());
        }
        List<VideoInteractiveQuestionDtos.Option> options = new java.util.ArrayList<>();
        for (JsonNode option : question.getOptionsJson()) {
            JsonNode id = option.get("id");
            JsonNode text = option.get("text");
            if (id == null || text == null || !id.isTextual() || !text.isTextual()) {
                throw new IllegalStateException("Invalid option for video question " + question.getId());
            }
            options.add(new VideoInteractiveQuestionDtos.Option(id.asText(), text.asText()));
        }
        boolean answeredCorrectly = student != null && attemptRepository
                .existsByStudentIdAndInteractiveQuestionIdAndIsCorrectTrue(
                        student.getId(), interactiveQuestion.getId());
        return new VideoInteractiveQuestionDtos.Question(
                interactiveQuestion.getId(),
                question.getQuestionText(),
                List.copyOf(options),
                interactiveQuestion.getVideoTimestamp(),
                answeredCorrectly);
    }

    private boolean containsOption(JsonNode options, String selectedOption) {
        if (options == null || !options.isArray()) return false;
        for (JsonNode option : options) {
            if (option.path("id").asText().equals(selectedOption)) return true;
        }
        return false;
    }

    private User findStudent(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
}
