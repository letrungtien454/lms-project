package lms_backend_core.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AiTutorRequest(
        @NotBlank @Size(max = 2000) String question,
        Long courseId,
        @NotNull Long lessonId) {
}
