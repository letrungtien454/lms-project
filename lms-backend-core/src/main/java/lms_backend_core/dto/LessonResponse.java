package lms_backend_core.dto;

import lms_backend_core.entity.Lesson;
import java.util.List;

public record LessonResponse(
        Long id,
        String name,
        String content,
        String videoUrl,
        Boolean isPreview,
        Integer orderIndex,
        Integer durationSeconds,
        String lessonType,
        List<AttachmentResponse> attachments) {

    public static LessonResponse from(Lesson lesson, boolean includeLearningContent) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getName(),
                includeLearningContent ? lesson.getContent() : null,
                includeLearningContent ? lesson.getVideoUrl() : null,
                lesson.getIsPreview(),
                lesson.getOrderIndex(),
                lesson.getDurationSeconds(),
                lesson.getLessonType() == null ? "VIDEO" : lesson.getLessonType().name(),
                List.of());
    }
}
