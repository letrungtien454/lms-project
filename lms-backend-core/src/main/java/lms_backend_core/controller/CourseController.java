package lms_backend_core.controller;

import lms_backend_core.dto.CourseResponse;
import lms_backend_core.entity.Course;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.service.LearningFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

        private final CourseRepository courseRepository;
        private final LearningFlowService learningFlowService;

        // 1. Lấy tất cả khóa học đã xuất bản
        @GetMapping
        public ResponseEntity<List<CourseResponse>> getAllPublishedCourses() {
                List<CourseResponse> courses = courseRepository.findByIsPublishedTrue()
                                .stream()
                                .map(course -> CourseResponse.builder()
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
                                                .build())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(courses);
        }

        // 2. Lấy chi tiết 1 khóa học theo ID (ĐÃ BỔ SUNG MAP CHAPTERS)
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
                                .chapters(course.getChapters().stream()
                                                .map(chapter -> lms_backend_core.dto.ChapterResponse.from(chapter, enrolled))
                                                .toList())
                                .build();

                return ResponseEntity.ok(response);
        }
}