package lms_backend_core.controller;

import lms_backend_core.dto.CourseResponse;
import lms_backend_core.entity.Course;
import lms_backend_core.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;

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
                        .thumbnailUrl(course.getThumbnailUrl())
                        .instructorName(course.getTeacher() != null ? course.getTeacher().getFullName() : "EduFlow")
                        .categoryName(course.getCategory() != null ? course.getCategory().getName() : "General")
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(courses);
    }

    // 2. BỔ SUNG: Lấy chi tiết 1 khóa học theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        CourseResponse response = CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .thumbnailUrl(course.getThumbnailUrl())
                .instructorName(course.getTeacher() != null ? course.getTeacher().getFullName() : "EduFlow")
                .categoryName(course.getCategory() != null ? course.getCategory().getName() : "General")
                .build();

        return ResponseEntity.ok(response);
    }
}