package lms_backend_core.dto;

import lms_backend_core.entity.Enrollment;
import lms_backend_core.entity.PaymentOrder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public final class StudentDtos {

    private StudentDtos() {
    }

    public record EnrolledCourse(
            Long id,
            String title,
            String instructorName,
            String categoryName,
            String thumbnailUrl,
            OffsetDateTime enrolledAt,
            long completedLessons,
            long totalLessons,
            int progressPercent) {
        public static EnrolledCourse from(
                Enrollment enrollment,
                long completedLessons,
                long totalLessons) {
            var course = enrollment.getCourse();
            int progressPercent = totalLessons == 0 ? 0
                    : (int) Math.round(completedLessons * 100.0 / totalLessons);
            return new EnrolledCourse(
                    course.getId(),
                    course.getTitle(),
                    course.getTeacher() == null ? "EduFlow" : course.getTeacher().getFullName(),
                    course.getCategory() == null ? "Chưa phân loại" : course.getCategory().getName(),
                    course.getThumbnailUrl(),
                    enrollment.getEnrolledAt(),
                    completedLessons,
                    totalLessons,
                    progressPercent);
        }
    }

    public record PaymentHistory(
            Long orderId,
            String transactionCode,
            Long courseId,
            String courseTitle,
            BigDecimal amount,
            String method,
            String status,
            OffsetDateTime createdAt,
            OffsetDateTime paidAt) {
        public static PaymentHistory from(PaymentOrder order) {
            return new PaymentHistory(
                    order.getId(),
                    order.getTxnRef(),
                    order.getCourse().getId(),
                    order.getCourse().getTitle(),
                    order.getAmount(),
                    order.getBankCode() == null || order.getBankCode().isBlank()
                            ? "VNPay" : order.getBankCode(),
                    order.getStatus().name(),
                    order.getCreatedAt(),
                    order.getPaidAt());
        }
    }
}
