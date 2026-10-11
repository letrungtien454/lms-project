package lms_backend_core.dto.review;

public record ReviewReplyRequest(
    String comment,
    Long parentId // null nếu trả lời trực tiếp bài đánh giá gốc
) {}