package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.TeacherDtos;
import lms_backend_core.entity.Category;
import lms_backend_core.entity.Course;
import lms_backend_core.entity.CourseStatus;
import lms_backend_core.entity.Enrollment;
import lms_backend_core.entity.LearningProgress;
import lms_backend_core.entity.Notification;
import lms_backend_core.entity.Review;
import lms_backend_core.entity.User;
import lms_backend_core.repository.*;
import lms_backend_core.repository.SystemSettingRepository;
import lms_backend_core.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationRepository notificationRepository;
    private final LearningProgressRepository learningProgressRepository;
    private final LessonRepository lessonRepository;
    private final AuditLogService auditLogService;
    private final SystemSettingRepository systemSettingRepository;

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public TeacherDtos.Dashboard dashboard(
            Authentication authentication,
            @RequestParam(defaultValue = "7") int days) {
        User teacher = currentTeacher(authentication);
        if (days != 7 && days != 14 && days != 30 && days != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "days must be 7, 14, 30, or 0 for all time.");
        }

        List<Course> courses = courseRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId());
        List<TeacherDtos.CourseView> courseViews = courses.stream().limit(5)
                .map(course -> TeacherDtos.CourseView.from(course, enrollmentRepository.countByCourseId(course.getId())))
                .toList();
        List<TeacherDtos.ReviewView> recentReviews = reviewRepository.findRecentByTeacherId(teacher.getId())
                .stream().limit(4).map(TeacherDtos.ReviewView::from).toList();
        List<TeacherDtos.EnrollmentView> recentEnrollments = enrollmentRepository
                .findTop5ByCourse_Teacher_IdOrderByEnrolledAtDesc(teacher.getId())
                .stream().map(TeacherDtos.EnrollmentView::from).toList();

        List<Enrollment> enrollments = days == 0
                ? enrollmentRepository.findByCourse_Teacher_IdOrderByEnrolledAtDesc(teacher.getId())
                : enrollmentRepository.findByCourse_Teacher_IdOrderByEnrolledAtDesc(teacher.getId()).stream()
                        .filter(enrollment -> enrollment.getEnrolledAt() != null
                                && !enrollment.getEnrolledAt().isBefore(
                                        LocalDate.now(BUSINESS_ZONE).minusDays(days - 1L)
                                                .atStartOfDay(BUSINESS_ZONE).toOffsetDateTime()))
                        .toList();
        Map<LocalDate, Long> enrollmentCounts = enrollments.stream()
                .filter(enrollment -> enrollment.getEnrolledAt() != null)
                .collect(Collectors.groupingBy(
                        enrollment -> enrollment.getEnrolledAt().atZoneSameInstant(BUSINESS_ZONE).toLocalDate(),
                        TreeMap::new,
                        Collectors.counting()));
        List<TeacherDtos.RegistrationPoint> trend = enrollmentCounts.entrySet().stream()
                .map(entry -> new TeacherDtos.RegistrationPoint(entry.getKey(), entry.getValue()))
                .toList();

        YearMonth currentMonth = YearMonth.now(BUSINESS_ZONE);
        OffsetDateTime monthStart = currentMonth.atDay(1).atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();
        OffsetDateTime nextMonth = currentMonth.plusMonths(1).atDay(1).atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();
        return new TeacherDtos.Dashboard(
                courses.size(),
                enrollmentRepository.countDistinctStudentsByTeacherId(teacher.getId()),
                Optional.ofNullable(reviewRepository.getAverageRatingByTeacherId(teacher.getId())).orElse(0.0),
                enrollmentRepository.sumRevenueByTeacherIdAndEnrolledAt(teacher.getId(), monthStart, nextMonth),
                courseViews,
                recentReviews,
                recentEnrollments,
                trend);
    }

    @GetMapping("/courses")
    @Transactional(readOnly = true)
    public List<TeacherDtos.CourseView> courses(Authentication authentication) {
        User teacher = currentTeacher(authentication);
        return courseRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId()).stream()
                .map(course -> TeacherDtos.CourseView.from(course, enrollmentRepository.countByCourseId(course.getId())))
                .toList();
    }

    @PostMapping("/courses")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherDtos.CourseView createCourse(
            @Valid @RequestBody TeacherDtos.CourseInput input,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        Course course = new Course();
        applyCourseInput(course, input, teacher);
        return TeacherDtos.CourseView.from(courseRepository.save(course), 0);
    }

    @PutMapping("/courses/{courseId}")
    @Transactional
    public TeacherDtos.CourseView updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody TeacherDtos.CourseInput input,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        Course course = courseRepository.findById(courseId)
                .filter(value -> value.getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        applyCourseInput(course, input, teacher);
        return TeacherDtos.CourseView.from(courseRepository.save(course),
                enrollmentRepository.countByCourseId(course.getId()));
    }

    @DeleteMapping("/courses/{courseId}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(
            @PathVariable Long courseId,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        Course course = courseRepository.findById(courseId)
                .filter(value -> value.getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));

        if (enrollmentRepository.countByCourseId(courseId) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa khóa học đã có học viên đăng ký.");
        }

        courseRepository.delete(course);
    }

    @GetMapping("/students")
    @Transactional(readOnly = true)
    public List<TeacherDtos.StudentEnrollmentView> students(Authentication authentication) {
        User teacher = currentTeacher(authentication);
        Map<Long, Long> totalLessonsByCourse = lessonRepository.countByTeacher(teacher.getId()).stream()
                .collect(Collectors.toMap(
                        LessonRepository.CourseLessonCount::getCourseId,
                        LessonRepository.CourseLessonCount::getLessonCount));
        Map<String, Long> completedByStudentAndCourse = learningProgressRepository
                .countByTeacherAndStatus(teacher.getId(), LearningProgress.Status.COMPLETED).stream()
                .collect(Collectors.toMap(
                        progress -> progress.getStudentId() + ":" + progress.getCourseId(),
                        LearningProgressRepository.CompletedProgressCount::getCompletedCount));
        return enrollmentRepository.findByCourse_Teacher_IdOrderByEnrolledAtDesc(teacher.getId()).stream()
                .map(enrollment -> {
                    Long courseId = enrollment.getCourse().getId();
                    long totalLessons = totalLessonsByCourse.getOrDefault(courseId, 0L);
                    long completedLessons = completedByStudentAndCourse.getOrDefault(
                            enrollment.getStudent().getId() + ":" + courseId, 0L);
                    int progressPercent = totalLessons == 0
                            ? 0
                            : (int) Math.min(100, completedLessons * 100 / totalLessons);
                    return new TeacherDtos.StudentEnrollmentView(
                            enrollment.getId(), enrollment.getStudent().getId(),
                            enrollment.getStudent().getFullName(), enrollment.getStudent().getEmail(),
                            courseId, enrollment.getCourse().getTitle(), enrollment.getStudent().getAvatarUrl(), enrollment.getAmountPaid(),
                            enrollment.getEnrolledAt(), completedLessons, totalLessons, progressPercent);
                }).toList();
    }

    @PostMapping("/students")
    @Transactional
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public TeacherDtos.StudentEnrollmentView addStudent(
            @Valid @RequestBody TeacherDtos.StudentEnrollmentInput input,
            Authentication authentication,
            HttpServletRequest request) {
        User teacher = currentTeacher(authentication);
        User student = userRepository.findByEmailIgnoreCase(input.studentEmail().trim())
                .filter(user -> user.getRole() == lms_backend_core.entity.Role.STUDENT)
                .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản học viên đang hoạt động với email này."));
        Course course = ownedCourse(input.courseId(), teacher);
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Học viên đã đăng ký khóa học này.");
        }
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .amountPaid(BigDecimal.ZERO)
                .build();
        Enrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.record(authentication, request, "Thêm học viên vào khóa học",
                student.getFullName() + " - " + course.getTitle(), "INFO");
        return studentEnrollmentView(saved);
    }

    @PutMapping("/students/{enrollmentId}")
    @Transactional
    public TeacherDtos.StudentEnrollmentView updateStudentEnrollment(
            @PathVariable Long enrollmentId,
            @Valid @RequestBody TeacherDtos.StudentEnrollmentInput input,
            Authentication authentication,
            HttpServletRequest request) {
        User teacher = currentTeacher(authentication);
        Enrollment enrollment = ownedEnrollment(enrollmentId, teacher);
        Course course = ownedCourse(input.courseId(), teacher);
        if (!course.getId().equals(enrollment.getCourse().getId())
                && enrollmentRepository.existsByStudentIdAndCourseId(enrollment.getStudent().getId(), course.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Học viên đã đăng ký khóa học này.");
        }
        enrollment.setCourse(course);
        Enrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.record(authentication, request, "Cập nhật đăng ký học viên",
                enrollment.getStudent().getFullName() + " - " + course.getTitle(), "INFO");
        return studentEnrollmentView(saved);
    }

    @DeleteMapping("/students/{enrollmentId}")
    @Transactional
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeStudentEnrollment(
            @PathVariable Long enrollmentId,
            Authentication authentication,
            HttpServletRequest request) {
        Enrollment enrollment = ownedEnrollment(enrollmentId, currentTeacher(authentication));
        String target = enrollment.getStudent().getFullName() + " - " + enrollment.getCourse().getTitle();
        try {
            enrollmentRepository.delete(enrollment);
            enrollmentRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa lượt đăng ký vì học viên đã có dữ liệu học tập trong khóa học.", exception);
        }
        auditLogService.record(authentication, request, "Xóa đăng ký học viên", target, "WARNING");
    }

    @GetMapping("/reviews")
    @Transactional(readOnly = true)
    public List<TeacherDtos.ReviewView> reviews(Authentication authentication) {
        User teacher = currentTeacher(authentication);
        return reviewRepository.findRecentByTeacherId(teacher.getId()).stream()
                .map(TeacherDtos.ReviewView::from).toList();
    }

    @GetMapping("/notifications")
    @Transactional(readOnly = true)
    public List<TeacherDtos.NotificationView> notifications(Authentication authentication) {
        User teacher = currentTeacher(authentication);
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(teacher.getId()).stream()
                .map(TeacherDtos.NotificationView::from).toList();
    }

    @PatchMapping("/notifications/{notificationId}/read")
    @Transactional
    public TeacherDtos.NotificationView markNotificationRead(
            @PathVariable Long notificationId,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, teacher.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notification.setIsRead(true);
        return TeacherDtos.NotificationView.from(notificationRepository.save(notification));
    }

    @GetMapping("/analytics")
    @Transactional(readOnly = true)
    public TeacherDtos.Analytics analytics(Authentication authentication) {
        User teacher = currentTeacher(authentication);
        List<Enrollment> enrollments =
                enrollmentRepository.findByCourse_Teacher_IdOrderByEnrolledAtDesc(teacher.getId());
        Map<LocalDate, Long> enrollmentCounts = enrollments.stream()
                .filter(enrollment -> enrollment.getEnrolledAt() != null)
                .collect(Collectors.groupingBy(
                        enrollment -> enrollment.getEnrolledAt().atZoneSameInstant(BUSINESS_ZONE).toLocalDate(),
                        TreeMap::new,
                        Collectors.counting()));
        YearMonth currentMonth = YearMonth.now(BUSINESS_ZONE);
        OffsetDateTime monthStart = currentMonth.atDay(1).atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();
        OffsetDateTime nextMonth = currentMonth.plusMonths(1).atDay(1).atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();
        BigDecimal totalRevenue = enrollments.stream()
                .map(Enrollment::getAmountPaid)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new TeacherDtos.Analytics(
                enrollments.size(),
                enrollmentRepository.countDistinctStudentsByTeacherId(teacher.getId()),
                totalRevenue,
                enrollmentRepository.sumRevenueByTeacherIdAndEnrolledAt(teacher.getId(), monthStart, nextMonth),
                enrollmentCounts.entrySet().stream()
                        .map(entry -> new TeacherDtos.RegistrationPoint(entry.getKey(), entry.getValue()))
                        .toList());
    }

    @PutMapping("/profile")
    @Transactional
    public lms_backend_core.dto.UserResponse updateProfile(
            @Valid @RequestBody TeacherDtos.ProfileUpdate input,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        teacher.setFullName(input.fullName().trim());
        teacher.setAvatarUrl(input.avatarUrl());
        return lms_backend_core.dto.UserResponse.from(userRepository.save(teacher));
    }

    private void applyCourseInput(Course course, TeacherDtos.CourseInput input, User teacher) {
        course.setTeacher(teacher);
        long minimumPrice = systemSettingRepository.findById(1L)
                .map(setting -> setting.getMinCoursePrice())
                .orElse(0L);
        if (input.price() != null && input.price().signum() > 0
                && input.price().compareTo(BigDecimal.valueOf(minimumPrice)) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giá khóa học không được thấp hơn mức tối thiểu " + minimumPrice + " VND.");
        }
        course.setTitle(input.title().trim());
        course.setDescription(input.description());
        course.setThumbnailUrl(input.thumbnailUrl());
        course.setRequirements(input.requirements());
        course.setOutcomes(input.outcomes());
        course.setPrice(input.price() == null ? BigDecimal.ZERO : input.price());
        if (input.level() != null) course.setLevel(input.level());
        boolean publish = Boolean.TRUE.equals(input.isPublished())
                || systemSettingRepository.findById(1L).map(setting -> setting.isAutoApproveCourses()).orElse(false);
        course.setIsPublished(publish);
        course.setStatus(publish ? CourseStatus.PUBLISHED : CourseStatus.PENDING);
        if (input.categoryId() == null) {
            course.setCategory(null);
        } else {
            Category category = categoryRepository.findById(input.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
            course.setCategory(category);
        }
    }

    private User currentTeacher(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    private Course ownedCourse(Long courseId, User teacher) {
        if (courseId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn khóa học.");
        }
        return courseRepository.findById(courseId)
                .filter(course -> course.getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học."));
    }

    private Enrollment ownedEnrollment(Long enrollmentId, User teacher) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đăng ký."));
        if (!enrollment.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đăng ký.");
        }
        return enrollment;
    }

    private TeacherDtos.StudentEnrollmentView studentEnrollmentView(Enrollment enrollment) {
        long totalLessons = lessonRepository.countByTeacher(enrollment.getCourse().getTeacher().getId()).stream()
                .filter(item -> item.getCourseId().equals(enrollment.getCourse().getId()))
                .mapToLong(LessonRepository.CourseLessonCount::getLessonCount)
                .findFirst().orElse(0L);
        long completedLessons = learningProgressRepository
                .countByTeacherAndStatus(enrollment.getCourse().getTeacher().getId(), LearningProgress.Status.COMPLETED)
                .stream()
                .filter(item -> item.getStudentId().equals(enrollment.getStudent().getId())
                        && item.getCourseId().equals(enrollment.getCourse().getId()))
                .mapToLong(LearningProgressRepository.CompletedProgressCount::getCompletedCount)
                .findFirst().orElse(0L);
        int progress = totalLessons == 0 ? 0 : (int) Math.min(100, completedLessons * 100 / totalLessons);
        return new TeacherDtos.StudentEnrollmentView(
                enrollment.getId(), enrollment.getStudent().getId(), enrollment.getStudent().getFullName(),
                enrollment.getStudent().getEmail(), enrollment.getCourse().getId(), enrollment.getCourse().getTitle(),
                enrollment.getStudent().getAvatarUrl(), enrollment.getAmountPaid(), enrollment.getEnrolledAt(),
                completedLessons, totalLessons, progress);
    }
}