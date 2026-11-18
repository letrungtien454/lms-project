package lms_backend_core.controller;

import lms_backend_core.dto.StudentDtos;
import lms_backend_core.entity.LearningProgress;
import lms_backend_core.entity.Role;
import lms_backend_core.entity.User;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.LearningProgressRepository;
import lms_backend_core.repository.LessonRepository;
import lms_backend_core.repository.PaymentOrderRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/students/me")
@RequiredArgsConstructor
public class StudentController {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LearningProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    @GetMapping("/courses")
    @Transactional(readOnly = true)
    public List<StudentDtos.EnrolledCourse> enrolledCourses(Authentication authentication) {
        User student = currentStudent(authentication);
        return enrollmentRepository.findAllByStudentIdOrderByEnrolledAtDesc(student.getId()).stream()
                .map(enrollment -> {
                    Long courseId = enrollment.getCourse().getId();
                    long totalLessons = lessonRepository.countByChapterCourseId(courseId);
                    long completedLessons = progressRepository.countByStudentIdAndLessonChapterCourseIdAndStatus(
                            student.getId(), courseId, LearningProgress.Status.COMPLETED);
                    return StudentDtos.EnrolledCourse.from(enrollment, completedLessons, totalLessons);
                })
                .toList();
    }

    @GetMapping("/payments")
    @Transactional(readOnly = true)
    public List<StudentDtos.PaymentHistory> paymentHistory(Authentication authentication) {
        User student = currentStudent(authentication);
        return paymentOrderRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(StudentDtos.PaymentHistory::from)
                .toList();
    }

    private User currentStudent(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students may access this resource.");
        }
        return user;
    }
}
