package lms_backend_core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public final class ChapterQuizDtos {
    private ChapterQuizDtos() {
    }

    public record StartRequest(
            @Min(1) @Max(500) int questionCount,
            @Min(1) @Max(120) int timeLimitMinutes) {
    }

    public record Option(String id, String text) {
    }

    public record Availability(Long chapterId, int availableQuestionCount) {
    }

    public record AttemptQuestion(Long id, String questionText, List<Option> options) {
    }

    public record StartedAttempt(
            Long attemptId,
            Long chapterId,
            int questionCount,
            int timeLimitMinutes,
            OffsetDateTime startedAt,
            OffsetDateTime expiresAt,
            List<AttemptQuestion> questions) {
    }

    public record AnswerRequest(@NotBlank @Size(max = 10) String selectedOption) {
    }

    public record SubmitRequest(@NotNull Map<@NotNull Long, @NotBlank @Size(max = 10) String> answers) {
    }

    public record SavedAnswer(Long questionId, String selectedOption) {
    }

    public record AnswerResponse(
            Long questionId,
            String selectedOption,
            boolean submitted,
            Result result) {
    }

    public record AnswerReview(
            Long questionId,
            String questionText,
            String selectedOption,
            String correctOption,
            String explanation,
            boolean correct) {
    }

    public record Result(
            Long attemptId,
            Long chapterId,
            int totalQuestions,
            int correctCount,
            int incorrectCount,
            BigDecimal score,
            int elapsedSeconds,
            int timeLimitMinutes,
            boolean autoSubmitted,
            OffsetDateTime startedAt,
            OffsetDateTime expiresAt,
            OffsetDateTime submittedAt,
            List<AnswerReview> answers) {
    }

    public record AttemptStatus(
            Long attemptId,
            boolean submitted,
            OffsetDateTime expiresAt,
            List<AttemptQuestion> questions,
            List<SavedAnswer> savedAnswers,
            Result result) {
    }
}
