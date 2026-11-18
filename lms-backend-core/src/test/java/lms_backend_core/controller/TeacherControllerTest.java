package lms_backend_core.controller;

import lms_backend_core.dto.TeacherDtos;
import lms_backend_core.entity.SystemSetting;
import lms_backend_core.entity.User;
import lms_backend_core.repository.*;
import lms_backend_core.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class TeacherControllerTest {
    private static final String TEACHER_EMAIL = "teacher@example.test";

    private final UserRepository userRepository = mock(UserRepository.class);
    private final CourseRepository courseRepository = mock(CourseRepository.class);
    private final SystemSettingRepository settingsRepository = mock(SystemSettingRepository.class);
    private final TeacherController controller = new TeacherController(
            userRepository,
            courseRepository,
            mock(EnrollmentRepository.class),
            mock(ReviewRepository.class),
            mock(CategoryRepository.class),
            mock(NotificationRepository.class),
            mock(LearningProgressRepository.class),
            mock(LessonRepository.class),
            mock(AuditLogService.class),
            settingsRepository);

    @Test
    void allowsFreeCoursesWhenMinimumPaidCoursePriceIsConfigured() {
        givenTeacherAndSettings(50_000);
        when(courseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        controller.createCourse(input("0"), authentication());

        verify(courseRepository).save(argThat(course -> BigDecimal.ZERO.compareTo(course.getPrice()) == 0));
    }

    @Test
    void allowsPaidCoursesAtTheConfiguredMinimumPrice() {
        givenTeacherAndSettings(50_000);
        when(courseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        controller.createCourse(input("50000"), authentication());

        verify(courseRepository).save(argThat(course -> new BigDecimal("50000").compareTo(course.getPrice()) == 0));
    }

    @Test
    void rejectsPaidCoursesBelowTheConfiguredMinimumPrice() {
        givenTeacherAndSettings(50_000);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.createCourse(input("10000"), authentication()));

        assertEquals(400, exception.getStatusCode().value());
        verify(courseRepository, never()).save(any());
    }

    private void givenTeacherAndSettings(long minimumPrice) {
        User teacher = new User();
        teacher.setId(1L);
        teacher.setEmail(TEACHER_EMAIL);
        when(userRepository.findByEmail(TEACHER_EMAIL)).thenReturn(Optional.of(teacher));
        SystemSetting settings = new SystemSetting();
        settings.setMinCoursePrice(minimumPrice);
        when(settingsRepository.findById(1L)).thenReturn(Optional.of(settings));
    }

    private static TeacherDtos.CourseInput input(String price) {
        return new TeacherDtos.CourseInput(
                "Course", null, null, null, null, new BigDecimal(price),
                null, false, null);
    }

    private static Authentication authentication() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(TEACHER_EMAIL);
        return authentication;
    }
}
