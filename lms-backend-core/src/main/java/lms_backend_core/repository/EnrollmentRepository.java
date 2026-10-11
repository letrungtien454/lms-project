package lms_backend_core.repository;

import lms_backend_core.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // Kiểm tra xem học viên đã đăng ký khóa học chưa
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // Bổ sung hàm này để Spring Data JPA tự động tạo query SELECT COUNT(*) WHERE course_id = ?
    long countByCourseId(Long courseId);

}