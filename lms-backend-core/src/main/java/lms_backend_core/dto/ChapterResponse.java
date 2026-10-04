package lms_backend_core.dto;

import lms_backend_core.entity.Chapter;
import java.util.List;

public record ChapterResponse(Long id, String title, Integer orderIndex, List<LessonResponse> lessons) {
    public static ChapterResponse from(Chapter chapter, boolean isEnrolled) {
        return new ChapterResponse(
                chapter.getId(),
                chapter.getTitle(),
                chapter.getOrderIndex(),
                chapter.getLessons() == null ? List.of()
                        : chapter.getLessons().stream()
                                .map(lesson -> LessonResponse.from(
                                        lesson, isEnrolled || Boolean.TRUE.equals(lesson.getIsPreview())))
                                .toList());
    }
}
