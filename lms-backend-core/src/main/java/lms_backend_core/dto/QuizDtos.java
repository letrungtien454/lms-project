package lms_backend_core.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public final class QuizDtos {
    private QuizDtos() {
    }

    public record Option(String id, String text) {
    }

    public record Question(Long id, String questionText, List<Option> options) {
    }

    public record Quiz(Long id, String title, Integer timeLimitMinutes, Integer passScore, List<Question> questions) {
    }

    public record Submission(@NotEmpty Map<@NotNull Long, @NotNull String> answers) {
    }

    public record AnswerResult(Long questionId, String selectedOption, String correctOption, String explanation) {
    }

    public record Result(Long quizId, double score, boolean passed, List<AnswerResult> answers) {
    }
}
