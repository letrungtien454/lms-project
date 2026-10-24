package lms_backend_core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lms_backend_core.entity.Course;
import lms_backend_core.entity.CourseLevel;
import lms_backend_core.entity.Enrollment;
import lms_backend_core.entity.Notification;
import lms_backend_core.entity.Review;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class TeacherDtos {

    private TeacherDtos() {
    }

    public record CourseInput(
            @NotBlank String title,
            String description,
            String thumbnailUrl,
            String requirements,
            String outcomes,
            @PositiveOrZero BigDecimal price,
            Integer categoryId,
            Boolean isPublished,
            CourseLevel level) {
    }

    public record CourseView(
            Long id,
            String title,
            String description,
            String thumbnailUrl,
            String requirements,
            String outcomes,
            BigDecimal price,
            CourseLevel level,
            Boolean isPublished,
            Integer categoryId,
            String categoryName,
            long studentCount,
            OffsetDateTime createdAt) {

        public static CourseView from(Course course, long studentCount) {
            return new CourseView(
                    course.getId(), course.getTitle(), course.getDescription(), course.getThumbnailUrl(),
                    course.getRequirements(), course.getOutcomes(), course.getPrice(), course.getLevel(), course.getIsPublished(),
                    course.getCategory() == null ? null : course.getCategory().getId(),
                    course.getCategory() == null ? null : course.getCategory().getName(),
                    studentCount, course.getCreatedAt());
        }
    }

    public record ReviewView(
            Long id,
            String studentName,
            String courseTitle,
            Integer rating,
            String comment,
            OffsetDateTime createdAt) {

        public static ReviewView from(Review review) {
            return new ReviewView(review.getId(), review.getStudent().getFullName(), review.getCourse().getTitle(),
                    review.getRating(), review.getComment(), review.getCreatedAt());
        }
    }

    public record EnrollmentView(
            Long id,
            Long studentId,
            String studentName,
            String studentEmail,
            Long courseId,
            String courseTitle,
            BigDecimal amountPaid,
            OffsetDateTime enrolledAt) {

        public static EnrollmentView from(Enrollment enrollment) {
            return new EnrollmentView(
                    enrollment.getId(), enrollment.getStudent().getId(), enrollment.getStudent().getFullName(),
                    enrollment.getStudent().getEmail(), enrollment.getCourse().getId(),
                    enrollment.getCourse().getTitle(), enrollment.getAmountPaid(), enrollment.getEnrolledAt());
        }
    }

    public record StudentEnrollmentView(
            Long id,
            Long studentId,
            String studentName,
            String studentEmail,
            Long courseId,
            String courseTitle,
            BigDecimal amountPaid,
            OffsetDateTime enrolledAt,
            long completedLessons,
            long totalLessons,
            int progressPercent) {
    }

    public record NotificationView(
            Long id,
            String title,
            String message,
            Boolean isRead,
            OffsetDateTime createdAt) {

        public static NotificationView from(Notification notification) {
            return new NotificationView(notification.getId(), notification.getTitle(), notification.getMessage(),
                    notification.getIsRead(), notification.getCreatedAt());
        }
    }

    public record RegistrationPoint(LocalDate date, long count) {
    }

    public record Dashboard(
            long totalCourses,
            long totalStudents,
            double averageRating,
            BigDecimal monthlyRevenue,
            List<CourseView> courses,
            List<ReviewView> recentReviews,
            List<EnrollmentView> recentEnrollments,
            List<RegistrationPoint> registrationTrend) {
    }

    public record ProfileUpdate(@NotBlank String fullName, String avatarUrl) {
    }

    public record Analytics(
            long totalEnrollments,
            long totalStudents,
            BigDecimal totalRevenue,
            BigDecimal monthlyRevenue,
            List<RegistrationPoint> registrationTrend) {
    }
}
