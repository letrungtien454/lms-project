package lms_backend_core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lms_backend_core.dto.ChapterQuizDtos;
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
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChapterQuizService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ChapterQuizQuestionRepository questionRepository;
    private final ChapterQuizAttemptRepository attemptRepository;

    @Transactional(readOnly = true)
    public ChapterQuizDtos.Availability availability(Long chapterId, Authentication authentication) {
        enrolledStudent(chapterId, authentication);
        return new ChapterQuizDtos.Availability(
                chapterId, questionRepository.findDistinctQuestionsInChapter(chapterId).size());
    }

    @Transactional
    public ChapterQuizDtos.StartedAttempt start(
            Long chapterId,
            ChapterQuizDtos.StartRequest request,
            Authentication authentication) {
        User student = enrolledStudent(chapterId, authentication);
        List<QuestionBank> available = questionRepository.findDistinctQuestionsInChapter(chapterId);
        if (request.questionCount() > available.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Requested question count exceeds the number of unique questions available in this chapter.");
        }
        Collections.shuffle(available);
        OffsetDateTime startedAt = OffsetDateTime.now();

        ChapterQuizAttempt attempt = new ChapterQuizAttempt();
        attempt.setChapter(chapterRepository.getReferenceById(chapterId));
        attempt.setStudent(student);
        attempt.setQuestionCount(request.questionCount());
        int durationSeconds = Math.multiplyExact(request.timeLimitMinutes(), 60);
        attempt.setDurationSeconds(durationSeconds);
        attempt.setStartedAt(startedAt);
        attempt.setDeadlineAt(startedAt.plusSeconds(durationSeconds));
        for (int i = 0; i < request.questionCount(); i++) {
            ChapterQuizAttemptQuestion attemptQuestion = new ChapterQuizAttemptQuestion();
            attemptQuestion.setAttempt(attempt);
            attemptQuestion.setQuestion(available.get(i));
            attemptQuestion.setPosition(i + 1);
            attempt.getQuestions().add(attemptQuestion);
        }
        attemptRepository.save(attempt);
        return toStartedAttempt(attempt);
    }

    @Transactional
    public ChapterQuizDtos.AnswerResponse saveAnswer(
            Long chapterId,
            Long attemptId,
            Long questionId,
            ChapterQuizDtos.AnswerRequest request,
            Authentication authentication) {
        User student = enrolledStudent(chapterId, authentication);
        ChapterQuizAttempt attempt = getForUpdate(chapterId, attemptId, student.getId());
        if (attempt.getSubmittedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This attempt has already been submitted.");
        }
        if (!OffsetDateTime.now().isBefore(attempt.getDeadlineAt())) {
            finalizeAttempt(attempt, true);
            return new ChapterQuizDtos.AnswerResponse(questionId, null, true, toResult(attempt));
        }
        ChapterQuizAttemptQuestion item = findAttemptQuestion(attempt, questionId);
        if (!containsOption(item.getQuestion().getOptionsJson(), request.selectedOption())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected option is not valid for this question.");
        }
        item.setSelectedOption(request.selectedOption());
        return new ChapterQuizDtos.AnswerResponse(questionId, request.selectedOption(), false, null);
    }

    @Transactional
    public ChapterQuizDtos.Result submit(
            Long chapterId,
            Long attemptId,
            ChapterQuizDtos.SubmitRequest request,
            Authentication authentication) {
        User student = enrolledStudent(chapterId, authentication);
        ChapterQuizAttempt attempt = getForUpdate(chapterId, attemptId, student.getId());
        if (attempt.getSubmittedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This attempt has already been submitted.");
        }
        if (request == null || request.answers() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An answers object is required.");
        }
        boolean expired = !OffsetDateTime.now().isBefore(attempt.getDeadlineAt());
        if (expired) {
            finalizeAttempt(attempt, true);
            return toResult(attempt);
        }
        Map<Long, String> answers = request.answers();
        Set<Long> attemptQuestionIds = attempt.getQuestions().stream()
                .map(item -> item.getQuestion().getId()).collect(java.util.stream.Collectors.toSet());
        if (!attemptQuestionIds.containsAll(answers.keySet())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission contains a question outside this attempt.");
        }
        for (Map.Entry<Long, String> answer : answers.entrySet()) {
            ChapterQuizAttemptQuestion item = findAttemptQuestion(attempt, answer.getKey());
            if (!containsOption(item.getQuestion().getOptionsJson(), answer.getValue())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected option is not valid for this question.");
            }
            item.setSelectedOption(answer.getValue());
        }
        finalizeAttempt(attempt, false);
        return toResult(attempt);
    }

    @Transactional
    public ChapterQuizDtos.AttemptStatus getAttempt(
            Long chapterId,
            Long attemptId,
            Authentication authentication) {
        User student = enrolledStudent(chapterId, authentication);
        ChapterQuizAttempt attempt = getForUpdate(chapterId, attemptId, student.getId());
        if (attempt.getSubmittedAt() == null && !OffsetDateTime.now().isBefore(attempt.getDeadlineAt())) {
            finalizeAttempt(attempt, true);
        }
        if (attempt.getSubmittedAt() != null) {
            return new ChapterQuizDtos.AttemptStatus(
                    attempt.getId(), true, attempt.getDeadlineAt(), List.of(), List.of(), toResult(attempt));
        }
        List<ChapterQuizDtos.SavedAnswer> saved = attempt.getQuestions().stream()
                .filter(q -> q.getSelectedOption() != null)
                .map(q -> new ChapterQuizDtos.SavedAnswer(q.getQuestion().getId(), q.getSelectedOption()))
                .toList();
        return new ChapterQuizDtos.AttemptStatus(
                attempt.getId(), false, attempt.getDeadlineAt(), toQuestions(attempt), saved, null);
    }

    private User enrolledStudent(Long chapterId, Authentication authentication) {
        User student = authentication == null || !authentication.isAuthenticated()
                ? null : userRepository.findByEmail(authentication.getName()).orElse(null);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only enrolled students may take this quiz.");
        }
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found."));
        Long courseId = chapter.getCourse().getId();
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Enroll in this course to take the quiz.");
        }
        return student;
    }

    private ChapterQuizAttempt getForUpdate(Long chapterId, Long attemptId, Long studentId) {
        return attemptRepository.findForUpdate(attemptId, studentId, chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found."));
    }

    private ChapterQuizAttemptQuestion findAttemptQuestion(ChapterQuizAttempt attempt, Long questionId) {
        return attempt.getQuestions().stream()
                .filter(item -> item.getQuestion().getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Question is not part of this attempt."));
    }

    private void finalizeAttempt(ChapterQuizAttempt attempt, boolean autoSubmitted) {
        int correct = 0;
        for (ChapterQuizAttemptQuestion item : attempt.getQuestions()) {
            boolean isCorrect = item.getSelectedOption() != null
                    && item.getQuestion().getCorrectOption().equals(item.getSelectedOption());
            item.setIsCorrect(isCorrect);
            if (isCorrect) correct++;
        }
        OffsetDateTime now = OffsetDateTime.now();
        int elapsed = (int) Math.max(0, Math.min(attempt.getDurationSeconds(),
                Duration.between(attempt.getStartedAt(), now).getSeconds()));
        attempt.setSubmittedAt(now);
        attempt.setAutoSubmitted(autoSubmitted);
        attempt.setCorrectCount(correct);
        attempt.setIncorrectCount(attempt.getQuestionCount() - correct);
        attempt.setScore(BigDecimal.valueOf(correct * 100.0 / attempt.getQuestionCount())
                .setScale(2, RoundingMode.HALF_UP));
        attempt.setElapsedSeconds(elapsed);
    }

    private ChapterQuizDtos.StartedAttempt toStartedAttempt(ChapterQuizAttempt attempt) {
        return new ChapterQuizDtos.StartedAttempt(
                attempt.getId(), attempt.getChapter().getId(), attempt.getQuestionCount(),
                attempt.getDurationSeconds() / 60, attempt.getStartedAt(),
                attempt.getDeadlineAt(), toQuestions(attempt));
    }

    private List<ChapterQuizDtos.AttemptQuestion> toQuestions(ChapterQuizAttempt attempt) {
        return attempt.getQuestions().stream().map(item -> new ChapterQuizDtos.AttemptQuestion(
                item.getQuestion().getId(), item.getQuestion().getQuestionText(),
                toOptions(item.getQuestion().getOptionsJson()))).toList();
    }

    private ChapterQuizDtos.Result toResult(ChapterQuizAttempt attempt) {
        List<ChapterQuizDtos.AnswerReview> answers = attempt.getQuestions().stream()
                .map(item -> new ChapterQuizDtos.AnswerReview(
                        item.getQuestion().getId(),
                        item.getQuestion().getQuestionText(),
                        item.getSelectedOption(),
                        item.getQuestion().getCorrectOption(),
                        item.getQuestion().getExplanation(),
                        Boolean.TRUE.equals(item.getIsCorrect())))
                .toList();
        return new ChapterQuizDtos.Result(
                attempt.getId(), attempt.getChapter().getId(), attempt.getQuestionCount(),
                attempt.getCorrectCount(), attempt.getIncorrectCount(), attempt.getScore(),
                attempt.getElapsedSeconds(), attempt.getDurationSeconds() / 60, attempt.isAutoSubmitted(), attempt.getStartedAt(),
                attempt.getDeadlineAt(), attempt.getSubmittedAt(), answers);
    }

    private List<ChapterQuizDtos.Option> toOptions(JsonNode options) {
        if (options == null || !options.isArray()) {
            throw new IllegalStateException("Question options_json must be an array.");
        }
        return MAPPER.convertValue(options,
                MAPPER.getTypeFactory().constructCollectionType(List.class, ChapterQuizDtos.Option.class));
    }

    private boolean containsOption(JsonNode options, String selectedOption) {
        if (options == null || !options.isArray()) return false;
        for (JsonNode option : options) {
            if (option.path("id").isTextual() && selectedOption.equals(option.path("id").asText())) return true;
        }
        return false;
    }
}
