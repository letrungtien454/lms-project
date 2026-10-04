package lms_backend_core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProgressUpdateRequest(
        @Min(0) Integer lastPlaybackTime,
        @NotNull Boolean completed) {
}
