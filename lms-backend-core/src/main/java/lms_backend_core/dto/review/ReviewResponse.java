package lms_backend_core.dto.review;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record ReviewResponse(
    Long id,
    Long studentId,
    String studentName,
    String studentAvatar,
    Integer rating,
    String comment,
    OffsetDateTime createdAt,
    long helpfulCount,
    boolean helpfulByMe,
    boolean editableByMe,
    List<ReplyResponse> replies
) {
    public record ReplyResponse(
        Long id,
        Long userId,
        String userName,
        String userAvatar,
        String comment,
        OffsetDateTime createdAt,
        Long parentId,          // ID của reply cha
        long helpfulCount,      // Lượt like reply
        boolean helpfulByMe     // Đã like reply này chưa
    ) {}

    public record ReviewListResponse(
        double averageRating,
        long reviewCount,
        Map<Integer, Long> ratingDistribution,
        List<ReviewResponse> reviews
    ) {}

    public record HelpfulResponse(
        boolean helpfulByMe,
        long helpfulCount
    ) {}
}