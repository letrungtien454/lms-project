package lms_backend_core.dto;

import lms_backend_core.entity.LearningProgress;

public record ProgressResponse(Long lessonId, String status, Integer lastPlaybackTime) {
    public static ProgressResponse from(LearningProgress progress) {
        return new ProgressResponse(
                progress.getLesson().getId(),
                progress.getStatus().name(),
                progress.getLastPlaybackTime());
    }
}
