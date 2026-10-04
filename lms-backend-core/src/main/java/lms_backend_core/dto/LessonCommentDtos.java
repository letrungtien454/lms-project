package lms_backend_core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lms_backend_core.entity.LessonComment;

import java.time.OffsetDateTime;

public final class LessonCommentDtos {

    private LessonCommentDtos() {
    }

    public record CreateRequest(
            Long parentCommentId,
            @NotBlank @Size(max = 2000) String content) {
    }

    public record Comment(
            Long id,
            Long parentCommentId,
            String authorName,
            String content,
            OffsetDateTime createdAt,
            long helpfulCount,
            boolean helpfulByCurrentUser) {

        public static Comment from(LessonComment comment, long helpfulCount, boolean helpfulByCurrentUser) {
            return new Comment(
                    comment.getId(),
                    comment.getParent() == null ? null : comment.getParent().getId(),
                    comment.getUser().getFullName(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    helpfulCount,
                    helpfulByCurrentUser);
        }
    }
}
