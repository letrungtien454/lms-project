package lms_backend_core.controller;

import lms_backend_core.dto.CourseResponse;
import lms_backend_core.entity.Course;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.LessonRepository;
import lms_backend_core.repository.ReviewRepository;
import lms_backend_core.service.LearningFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

        private final CourseRepository courseRepository;
        private final EnrollmentRepository enrollmentRepository; // Inject EnrollmentRepository
        private final LessonRepository lessonRepository;
        private final ReviewRepository reviewRepository;
        private final LearningFlowService learningFlowService;

        // 1. Lấy tất cả khóa học đã xuất bản
        @GetMapping
        @Transactional(readOnly = true)
        public ResponseEntity<List<CourseResponse>> getAllPublishedCourses() {
                Map<Long, ReviewRepository.CourseRatingSummary> ratings = reviewRepository.findCourseRatingSummaries()
                                .stream().collect(Collectors.toMap(
                                                ReviewRepository.CourseRatingSummary::getCourseId,
                                                summary -> summary));
                Map<Long, Long> durations = lessonRepository.sumDurationSecondsByCourse()
                                .stream().collect(Collectors.toMap(
                                                LessonRepository.CourseDurationSummary::getCourseId,
                                                LessonRepository.CourseDurationSummary::getTotalDurationSeconds));
                Map<Long, Long> studentCounts = enrollmentRepository.countStudentsByCourse()
                                .stream().collect(Collectors.toMap(
                                                EnrollmentRepository.CourseStudentCount::getCourseId,
                                                EnrollmentRepository.CourseStudentCount::getStudentCount));
                List<CourseResponse> courses = courseRepository.findByIsPublishedTrue()
                                .stream()
                                .map(course -> {
                                        var rating = ratings.get(course.getId());
                                        return CourseResponse.builder()
                                                .id(course.getId())
                                                .title(course.getTitle())
                                                .description(course.getDescription())
                                                .price(course.getPrice())
                                                .level(course.getLevel().name())
                                                .thumbnailUrl(course.getThumbnailUrl())
                                                .instructorName(course.getTeacher() != null
                                                                ? course.getTeacher().getFullName()
                                                                : "EduFlow")
                                                .categoryName(course.getCategory() != null
                                                                ? course.getCategory().getName()
                                                                : "General")
                                                .averageRating(rating == null ? null : rating.getAverageRating())
                                                .reviewCount(rating == null ? 0 : rating.getReviewCount())
                                                .studentCount(studentCounts.getOrDefault(course.getId(), 0L))
                                                .totalDurationSeconds(durations.getOrDefault(course.getId(), 0L))
                                                .build();
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(courses);
        }

        // 2. Lấy chi tiết 1 khóa học theo ID
        @GetMapping("/{id}")
        @Transactional(readOnly = true)
        public ResponseEntity<?> getCourseById(@PathVariable Long id, Authentication authentication) {
                Course course = courseRepository.findWithDetailsById(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
                if (!Boolean.TRUE.equals(course.getIsPublished())) {
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found.");
                }
                boolean enrolled = learningFlowService.isEnrolled(id, authentication);

                CourseResponse response = CourseResponse.builder()
                                .id(course.getId())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .outcomes(course.getOutcomes())
                                .requirements(course.getRequirements())
                                .price(course.getPrice())
                                .level(course.getLevel().name())
                                .thumbnailUrl(course.getThumbnailUrl())
                                .instructorName(course.getTeacher() != null ? course.getTeacher().getFullName()
                                                : "EduFlow")
                                .categoryName(course.getCategory() != null ? course.getCategory().getName() : "General")
                                .averageRating(reviewRepository.getAverageRating(id))
                                .reviewCount(reviewRepository.countByCourseId(id))
                                .studentCount(enrollmentRepository.countByCourseId(id))
                                .totalDurationSeconds(lessonRepository.sumDurationSecondsByCourseId(id))
                                .chapters(course.getChapters().stream()
                                                .map(chapter -> lms_backend_core.dto.ChapterResponse.from(chapter, enrolled))
                                                .toList())
                                .build();

                return ResponseEntity.ok(response);
        }

        // 3. Đếm số lượng học viên đăng ký của khóa học (Xử lý lỗi 404 cho Frontend)
        @GetMapping("/{id}/enrollment-count")
        public ResponseEntity<Long> getEnrollmentCount(@PathVariable Long id) {
                long count = enrollmentRepository.countByCourseId(id);
                return ResponseEntity.ok(count);
        }
}