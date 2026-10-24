package lms_backend_core.dto;

import jakarta.validation.constraints.NotBlank;
import lms_backend_core.entity.TeacherRequest;

import java.time.OffsetDateTime;

public final class TeacherRequestDtos {

    private TeacherRequestDtos() {
    }

    public record Submission(String bio, String experience, String cvUrl) {
    }

    public record Decision(@NotBlank String status, String adminNote) {
    }

    public record Response(
            Long id,
            Long userId,
            String fullName,
            String email,
            String bio,
            String experience,
            String cvUrl,
            String status,
            String adminNote,
            OffsetDateTime createdAt) {

        public static Response from(TeacherRequest request) {
            return new Response(
                    request.getId(),
                    request.getUser().getId(),
                    request.getUser().getFullName(),
                    request.getUser().getEmail(),
                    request.getBio(),
                    request.getExperience(),
                    request.getCvUrl(),
                    request.getStatus().name(),
                    request.getAdminNote(),
                    request.getCreatedAt());
        }
    }
}
