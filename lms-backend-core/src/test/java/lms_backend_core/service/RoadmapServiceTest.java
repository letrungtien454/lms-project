package lms_backend_core.service;

import lms_backend_core.dto.RoadmapDtos;
import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoadmapServiceTest {

    private final RoadmapRepository roadmapRepository = mock(RoadmapRepository.class);
    private final UserRoadmapRepository userRoadmapRepository = mock(UserRoadmapRepository.class);
    private final CourseRepository courseRepository = mock(CourseRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final EnrollmentRepository enrollmentRepository = mock(EnrollmentRepository.class);
    private final LessonRepository lessonRepository = mock(LessonRepository.class);
    private final LearningProgressRepository progressRepository = mock(LearningProgressRepository.class);
    private final RoadmapService service = new RoadmapService(
            roadmapRepository, userRoadmapRepository, courseRepository, userRepository,
            enrollmentRepository, lessonRepository, progressRepository);

    @Test
    void rejectsDuplicateStageOrderBeforeSaving() {
        RoadmapDtos.RoadmapInput input = new RoadmapDtos.RoadmapInput(
                "Path", "path", null, null, null, null, null, null, false,
                List.of(
                        new RoadmapDtos.StageInput("First", null, 1, null, null),
                        new RoadmapDtos.StageInput("Second", null, 1, null, 25L)));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.create(input));

        assertEquals(400, exception.getStatusCode().value());
        verify(roadmapRepository, never()).save(any());
        verify(courseRepository, never()).findAllById(any());
    }

    @Test
    void savesRoadmapMetadataAndStageDuration() {
        when(roadmapRepository.existsBySlug("fullstack")).thenReturn(false);
        when(roadmapRepository.save(any(Roadmap.class))).thenAnswer(invocation -> invocation.getArgument(0));
        RoadmapDtos.RoadmapInput input = new RoadmapDtos.RoadmapInput(
                "Fullstack", "fullstack", "Description", "Web Fullstack", 10,
                "Người mới", null, "from-blue-600 to-indigo-700", false,
                List.of(new RoadmapDtos.StageInput("Nền tảng", null, 1, 2, null)));

        service.create(input);

        var saved = org.mockito.ArgumentCaptor.forClass(Roadmap.class);
        verify(roadmapRepository).save(saved.capture());
        Roadmap roadmap = saved.getValue();
        assertEquals("Web Fullstack", roadmap.getCategory());
        assertEquals(10, roadmap.getDurationWeeks());
        assertEquals("Người mới", roadmap.getTargetAudience());
        assertEquals(2, roadmap.getStages().get(0).getDurationWeeks());
    }

    @Test
    void studentListReportsRoadmapEnrollmentAndCourseLessonProgress() {
        User student = new User();
        student.setId(7L);
        student.setEmail("student@example.test");
        student.setRole(Role.STUDENT);
        when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
        when(userRoadmapRepository.findAllByStudentId(7L)).thenReturn(List.of());

        Course course = new Course();
        course.setId(20L);
        course.setTitle("Java");
        RoadmapStage stage = new RoadmapStage();
        stage.setId(3L);
        stage.setTitle("Learn Java");
        stage.setOrderIndex(1);
        stage.setCourse(course);
        Roadmap roadmap = new Roadmap();
        roadmap.setId(11L);
        roadmap.setTitle("Backend");
        roadmap.setSlug("backend");
        roadmap.setIsPublished(true);
        roadmap.setStages(List.of(stage));
        when(roadmapRepository.findAllByOrderByIdAsc()).thenReturn(List.of(roadmap));
        when(lessonRepository.countByChapterCourseId(20L)).thenReturn(4L);
        when(progressRepository.countByStudentIdAndLessonChapterCourseIdAndStatus(
                7L, 20L, LearningProgress.Status.COMPLETED)).thenReturn(3L);
        when(enrollmentRepository.existsByStudentIdAndCourseId(7L, 20L)).thenReturn(true);

        List<RoadmapDtos.StudentRoadmap> result = service.studentList(student.getEmail());

        assertEquals(1, result.size());
        RoadmapDtos.StudentRoadmap studentRoadmap = result.get(0);
        assertFalse(studentRoadmap.enrolled());
        assertEquals(75, studentRoadmap.progressPercent());
        assertTrue(studentRoadmap.stages().get(0).courseEnrolled());
        assertEquals(3L, studentRoadmap.stages().get(0).completedLessons());
    }
}
