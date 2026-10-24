package lms_backend_core.dto;

import jakarta.validation.constraints.NotBlank;
import lms_backend_core.entity.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record Dashboard(long totalUsers, long totalCourses, long totalTeachers, BigDecimal totalRevenue) {
    }

    public record UserUpdate(String role, Boolean isActive) {
    }

    public record UserCreate(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password,
            @NotBlank String role,
            String avatarUrl) {
    }

    public record UserView(
            Long id,
            String email,
            String fullName,
            String avatarUrl,
            String role,
            Boolean isActive,
            OffsetDateTime createdAt) {

        public static UserView from(User user) {
            return new UserView(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(),
                    user.getRole().name(), user.getIsActive(), user.getCreatedAt());
        }
    }

    public record CourseView(
            Long id,
            String title,
            String teacherName,
            String categoryName,
            BigDecimal price,
            Boolean isPublished,
            String status,
            long studentCount,
            OffsetDateTime createdAt,
            String thumbnailUrl) {

        public static CourseView from(Course course, long studentCount) {
            return new CourseView(course.getId(), course.getTitle(), course.getTeacher().getFullName(),
                    course.getCategory() == null ? null : course.getCategory().getName(),
                    course.getPrice(), course.getIsPublished(),
                    course.getStatus() == null
                            ? (Boolean.TRUE.equals(course.getIsPublished()) ? "PUBLISHED" : "PENDING")
                            : course.getStatus().name(),
                    studentCount, course.getCreatedAt(), course.getThumbnailUrl());
        }
    }

    public record PublishedUpdate(Boolean isPublished) {
    }

    public record CourseStatusUpdate(@NotBlank String status) {
    }

    public record TopCourse(
            Long id,
            String title,
            String categoryName,
            String thumbnailUrl,
            long studentCount,
            BigDecimal revenue) {
    }

    public record Analytics(
            long totalUsers,
            long totalTeachers,
            long totalCourses,
            long totalEnrollments,
            BigDecimal totalRevenue,
            List<TopCourse> topCourses) {
    }

    public record CategoryInput(@NotBlank String name, @NotBlank String slug, String description) {
    }

    public record CategoryView(Integer id, String name, String slug, String description) {
        public static CategoryView from(Category category) {
            return new CategoryView(category.getId(), category.getName(), category.getSlug(), category.getDescription());
        }
    }

    public record NotificationInput(@NotBlank String title, @NotBlank String message, List<Long> userIds) {
    }

    public record ReviewModeration(Long id, String studentName, String courseTitle, Integer rating,
                                   String comment, OffsetDateTime createdAt) {
        public static ReviewModeration from(Review review) {
            return new ReviewModeration(review.getId(), review.getStudent().getFullName(),
                    review.getCourse().getTitle(), review.getRating(), review.getComment(), review.getCreatedAt());
        }
    }

    public record CommentModeration(Long id, String userName, Long lessonId, String lessonTitle,
                                    String content, OffsetDateTime createdAt) {
        public static CommentModeration from(LessonComment comment) {
            return new CommentModeration(comment.getId(), comment.getUser().getFullName(),
                    comment.getLesson().getId(), comment.getLesson().getName(),
                    comment.getContent(), comment.getCreatedAt());
        }
    }
}
