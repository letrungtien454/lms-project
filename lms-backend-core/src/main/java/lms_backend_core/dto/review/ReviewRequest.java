
package lms_backend_core.dto.review;

public record ReviewRequest(
    Integer rating,
    String comment
) {}
