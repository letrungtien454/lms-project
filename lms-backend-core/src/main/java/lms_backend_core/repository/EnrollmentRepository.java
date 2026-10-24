package lms_backend_core.repository;

import lms_backend_core.entity.Enrollment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    interface CourseEnrollmentSummary {
        Long getCourseId();
        String getTitle();
        String getCategoryName();
        String getThumbnailUrl();
        Long getStudentCount();
        BigDecimal getRevenue();
    }

    // Kiểm tra xem học viên đã đăng ký khóa học chưa
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // Bổ sung hàm này để Spring Data JPA tự động tạo query SELECT COUNT(*) WHERE course_id = ?
    long countByCourseId(Long courseId);

    @Query("SELECT COUNT(DISTINCT e.student.id) FROM Enrollment e WHERE e.course.teacher.id = :teacherId")
    long countDistinctStudentsByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COALESCE(SUM(e.amountPaid), 0) FROM Enrollment e WHERE e.course.teacher.id = :teacherId AND e.enrolledAt >= :from AND e.enrolledAt < :to")
    BigDecimal sumRevenueByTeacherIdAndEnrolledAt(
            @Param("teacherId") Long teacherId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to);

    @Query("SELECT COALESCE(SUM(e.amountPaid), 0) FROM Enrollment e")
    BigDecimal sumRevenue();

    @Query("""
            SELECT COALESCE(SUM(e.amountPaid), 0)
            FROM Enrollment e
            WHERE e.enrolledAt >= :from
            """)
    BigDecimal sumRevenueSince(@Param("from") OffsetDateTime from);

    long countByEnrolledAtGreaterThanEqual(OffsetDateTime from);

    @Query("""
            SELECT c.id AS courseId,
                   c.title AS title,
                   category.name AS categoryName,
                   c.thumbnailUrl AS thumbnailUrl,
                   COUNT(e.id) AS studentCount,
                   SUM(e.amountPaid) AS revenue
            FROM Enrollment e
            JOIN e.course c
            LEFT JOIN c.category category
            GROUP BY c.id, c.title, category.name, c.thumbnailUrl
            ORDER BY COUNT(e.id) DESC, SUM(e.amountPaid) DESC, c.title ASC
            """)
    List<CourseEnrollmentSummary> findTopCourses(Pageable pageable);

    @Query("""
            SELECT c.id AS courseId,
                   c.title AS title,
                   category.name AS categoryName,
                   c.thumbnailUrl AS thumbnailUrl,
                   COUNT(e.id) AS studentCount,
                   SUM(e.amountPaid) AS revenue
            FROM Enrollment e
            JOIN e.course c
            LEFT JOIN c.category category
            WHERE e.enrolledAt >= :from
            GROUP BY c.id, c.title, category.name, c.thumbnailUrl
            ORDER BY COUNT(e.id) DESC, SUM(e.amountPaid) DESC, c.title ASC
            """)
    List<CourseEnrollmentSummary> findTopCoursesSince(
            @Param("from") OffsetDateTime from,
            Pageable pageable);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.teacher.id = :teacherId AND e.enrolledAt >= :from")
    long countTeacherEnrollmentsSince(@Param("teacherId") Long teacherId, @Param("from") OffsetDateTime from);

    @EntityGraph(attributePaths = {"student", "course"})
    List<Enrollment> findTop5ByCourse_Teacher_IdOrderByEnrolledAtDesc(Long teacherId);

    @EntityGraph(attributePaths = {"student", "course"})
    List<Enrollment> findByCourse_Teacher_IdOrderByEnrolledAtDesc(Long teacherId);

}