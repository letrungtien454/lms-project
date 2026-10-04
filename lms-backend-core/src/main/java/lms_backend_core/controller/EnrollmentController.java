package lms_backend_core.controller;

import lms_backend_core.entity.Course;
import lms_backend_core.entity.Enrollment;
import lms_backend_core.entity.User;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollCourse(@PathVariable Long courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Bạn cần đăng nhập để thực hiện thao tác này!"));
        }

        String username = authentication.getName();
        User student = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học viên!"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        if (!Boolean.TRUE.equals(course.getIsPublished())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found.");
        }

        if (course.getPrice() != null && course.getPrice().signum() > 0) {
            return ResponseEntity.status(402).body(Map.of(
                    "message", "Khóa học cần thanh toán trước khi đăng ký. Chức năng thanh toán chưa được bật."));
        }

        // Kiểm tra xem đã đăng ký khóa học này chưa
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Bạn đã đăng ký khóa học này rồi!"));
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .amountPaid(course.getPrice())
                .build();

        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok(Map.of(
            "message", "Đăng ký khóa học thành công!",
            "courseId", courseId
        ));
    }

    // API Kiểm tra trạng thái đã đăng ký chưa cho Frontend
    @GetMapping("/check/{courseId}")
    public ResponseEntity<?> checkEnrollment(@PathVariable Long courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("isEnrolled", false));
        }

        String username = authentication.getName();
        User student = userRepository.findByEmail(username).orElse(null);

        if (student == null) {
            return ResponseEntity.ok(Map.of("isEnrolled", false));
        }

        boolean isEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId);

        return ResponseEntity.ok(Map.of(
            "isEnrolled", isEnrolled,
            "courseId", courseId
        ));
    }
}