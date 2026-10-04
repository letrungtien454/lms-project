package lms_backend_core.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public final class VideoInteractiveQuestionDtos {

    private VideoInteractiveQuestionDtos() {
    }

    public record Option(String id, String text) {
    }

    public record Question(
            Long id,
            String questionText,
            List<Option> options,
            Integer videoTimestamp,
            boolean answeredCorrectly) {
    }

    public record LessonQuestions(boolean reviewMode, List<Question> questions) {
    }

    public record AnswerSubmission(@NotBlank String selectedOption) {
    }

    public record AnswerResult(boolean correct, String correctOption, String explanation) {
    }
}
