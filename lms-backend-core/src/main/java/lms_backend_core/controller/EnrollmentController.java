package lms_backend_core.controller;

import lms_backend_core.entity.Course;
import lms_backend_core.entity.Enrollment;
import lms_backend_core.entity.User;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học viên!"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

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
        User student = userRepository.findByUsername(username).orElse(null);

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