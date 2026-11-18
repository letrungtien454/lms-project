package lms_backend_core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lms_backend_core.entity.Roadmap;
import lms_backend_core.entity.RoadmapStage;
import lms_backend_core.entity.UserRoadmap;

import java.time.OffsetDateTime;
import java.util.List;

public final class RoadmapDtos {

    private RoadmapDtos() {
    }

    public record StageInput(
            @NotBlank @Size(max = 255) String title,
            String description,
            @NotNull @Min(0) Integer orderIndex,
            @Positive Integer durationWeeks,
            Long courseId) {
    }

    public record RoadmapInput(
            @NotBlank @Size(max = 255) String title,
            @NotBlank @Size(max = 255) String slug,
            String description,
            @Size(max = 255) String category,
            @Positive Integer durationWeeks,
            @Size(max = 255) String targetAudience,
            String iconUrl,
            @Size(max = 50) String colorTheme,
            @NotNull Boolean isPublished,
            @NotNull List<@Valid StageInput> stages) {
    }

    public record Stage(
            Long id,
            String title,
            String description,
            int orderIndex,
            Integer durationWeeks,
            Long courseId,
            String courseTitle) {
        public static Stage from(RoadmapStage stage) {
            return new Stage(
                    stage.getId(),
                    stage.getTitle(),
                    stage.getDescription(),
                    stage.getOrderIndex(),
                    stage.getDurationWeeks(),
                    stage.getCourse() == null ? null : stage.getCourse().getId(),
                    stage.getCourse() == null ? null : stage.getCourse().getTitle());
        }
    }

    public record AdminRoadmap(
            Long id,
            String title,
            String slug,
            String description,
            String category,
            Integer durationWeeks,
            String targetAudience,
            String iconUrl,
            String colorTheme,
            boolean isPublished,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            List<Stage> stages) {
        public static AdminRoadmap from(Roadmap roadmap) {
            return new AdminRoadmap(
                    roadmap.getId(),
                    roadmap.getTitle(),
                    roadmap.getSlug(),
                    roadmap.getDescription(),
                    roadmap.getCategory(),
                    roadmap.getDurationWeeks(),
                    roadmap.getTargetAudience(),
                    roadmap.getIconUrl(),
                    roadmap.getColorTheme(),
                    Boolean.TRUE.equals(roadmap.getIsPublished()),
                    roadmap.getCreatedAt(),
                    roadmap.getUpdatedAt(),
                    roadmap.getStages().stream().map(Stage::from).toList());
        }
    }

    public record StudentStage(
            Long id,
            String title,
            String description,
            int orderIndex,
            Integer durationWeeks,
            Long courseId,
            String courseTitle,
            boolean courseEnrolled,
            long completedLessons,
            long totalLessons,
            int progressPercent) {
    }

    public record StudentRoadmap(
            Long id,
            String title,
            String slug,
            String description,
            String category,
            Integer durationWeeks,
            String targetAudience,
            String iconUrl,
            String colorTheme,
            boolean isPublished,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            boolean enrolled,
            OffsetDateTime enrolledAt,
            int progressPercent,
            List<StudentStage> stages) {
        public static StudentRoadmap from(
                Roadmap roadmap,
                UserRoadmap enrollment,
                List<StudentStage> stages) {
            long totalLessons = stages.stream().mapToLong(StudentStage::totalLessons).sum();
            long completedLessons = stages.stream().mapToLong(StudentStage::completedLessons).sum();
            int progress = totalLessons == 0 ? 0
                    : (int) Math.round(completedLessons * 100.0 / totalLessons);
            return new StudentRoadmap(
                    roadmap.getId(),
                    roadmap.getTitle(),
                    roadmap.getSlug(),
                    roadmap.getDescription(),
                    roadmap.getCategory(),
                    roadmap.getDurationWeeks(),
                    roadmap.getTargetAudience(),
                    roadmap.getIconUrl(),
                    roadmap.getColorTheme(),
                    Boolean.TRUE.equals(roadmap.getIsPublished()),
                    roadmap.getCreatedAt(),
                    roadmap.getUpdatedAt(),
                    enrollment != null,
                    enrollment == null ? null : enrollment.getEnrolledAt(),
                    progress,
                    stages);
        }
    }
}
