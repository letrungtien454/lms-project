package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.AdminDtos;
import lms_backend_core.dto.TeacherRequestDtos;
import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import lms_backend_core.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CategoryRepository categoryRepository;
    private final TeacherRequestRepository teacherRequestRepository;
    private final NotificationRepository notificationRepository;
    private final ReviewRepository reviewRepository;
    private final LessonCommentRepository lessonCommentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public AdminDtos.Dashboard dashboard() {
        return new AdminDtos.Dashboard(
                userRepository.count(),
                courseRepository.count(),
                userRepository.countByRole(Role.TEACHER),
                enrollmentRepository.sumRevenue());
    }

    @GetMapping("/analytics")
    @Transactional(readOnly = true)
    public AdminDtos.Analytics analytics(@RequestParam(defaultValue = "0") int days) {
        if (days != 0 && days != 7 && days != 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "days must be 0, 7, or 30.");
        }
        var from = days == 0 ? null : java.time.OffsetDateTime.now().minusDays(days);
        var pageable = PageRequest.of(0, 5);
        var topCourses = (from == null
                ? enrollmentRepository.findTopCourses(pageable)
                : enrollmentRepository.findTopCoursesSince(from, pageable))
                .stream()
                .map(course -> new AdminDtos.TopCourse(
                        course.getCourseId(), course.getTitle(), course.getCategoryName(),
                        course.getThumbnailUrl(), course.getStudentCount(), course.getRevenue()))
                .toList();
        return new AdminDtos.Analytics(
                userRepository.count(),
                userRepository.countByRole(Role.TEACHER),
                courseRepository.count(),
                from == null ? enrollmentRepository.count() : enrollmentRepository.countByEnrolledAtGreaterThanEqual(from),
                from == null ? enrollmentRepository.sumRevenue() : enrollmentRepository.sumRevenueSince(from),
                topCourses);
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<AdminDtos.UserView> users(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String query) {
        List<User> users = role == null || role.isBlank()
                ? userRepository.findAllByOrderByCreatedAtDesc()
                : userRepository.findByRoleOrderByCreatedAtDesc(parseRole(role));
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return users.stream()
                .filter(user -> normalizedQuery.isEmpty()
                        || user.getFullName().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedQuery))
                .map(AdminDtos.UserView::from)
                .toList();
    }

    @PostMapping("/users")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public AdminDtos.UserView createUser(
            @Valid @RequestBody AdminDtos.UserCreate input,
            org.springframework.security.core.Authentication authentication,
            HttpServletRequest request) {
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use.");
        }
        User user = User.builder()
                .fullName(input.fullName().trim())
                .email(email)
                .password(passwordEncoder.encode(input.password()))
                .role(parseRole(input.role()))
                .avatarUrl(input.avatarUrl())
                .isActive(true)
                .build();
        try {
            AdminDtos.UserView saved = AdminDtos.UserView.from(userRepository.save(user));
            auditLogService.record(authentication, request, "Tạo tài khoản", "User #" + saved.id() + " (" + saved.email() + ")", "INFO");
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use.", exception);
        }
    }

    @PatchMapping("/users/{userId}")
    @Transactional
    public AdminDtos.UserView updateUser(
            @PathVariable Long userId,
            @RequestBody AdminDtos.UserUpdate update,
            org.springframework.security.core.Authentication authentication,
            HttpServletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (update.fullName() != null) {
            if (update.fullName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name cannot be blank.");
            }
            user.setFullName(update.fullName().trim());
        }
        if (update.email() != null) {
            String email = update.email().trim().toLowerCase(Locale.ROOT);
            if (email.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email cannot be blank.");
            }
            if (userRepository.findByEmailIgnoreCase(email)
                    .filter(existing -> !existing.getId().equals(userId)).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use.");
            }
            user.setEmail(email);
        }
        if (update.role() != null) {
            Role newRole = parseRole(update.role());
            if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
                if (user.getEmail().equals(authentication.getName())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "You cannot remove your own admin role.");
                }
                if (userRepository.countByRole(Role.ADMIN) <= 1) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "The last admin cannot be demoted.");
                }
            }
            user.setRole(newRole);
        }
        if (update.isActive() != null) {
            if (!update.isActive() && user.getEmail().equals(authentication.getName())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You cannot deactivate your own account.");
            }
            user.setIsActive(update.isActive());
        }
        AdminDtos.UserView saved = AdminDtos.UserView.from(userRepository.save(user));
        auditLogService.record(authentication, request, "Cập nhật tài khoản", "User #" + userId + " (" + user.getEmail() + ")", "INFO");
        return saved;
    }

    @DeleteMapping("/users/{userId}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable Long userId,
            org.springframework.security.core.Authentication authentication,
            HttpServletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (user.getEmail().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You cannot delete your own account.");
        }
        if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The last admin cannot be deleted.");
        }
        try {
            userRepository.delete(user);
            userRepository.flush();
            auditLogService.record(authentication, request, "Xóa tài khoản", "User #" + userId + " (" + user.getEmail() + ")", "WARNING");
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "This account has related course or learning records and cannot be deleted.", exception);
        }
    }

    @GetMapping("/teacher-requests")
    @Transactional(readOnly = true)
    public List<TeacherRequestDtos.Response> teacherRequests(@RequestParam(required = false) String status) {
        List<TeacherRequest> requests = status == null || status.isBlank()
                ? teacherRequestRepository.findAllByOrderByCreatedAtDesc()
                : teacherRequestRepository.findAllByStatusOrderByCreatedAtDesc(parseRequestStatus(status));
        return requests.stream().map(TeacherRequestDtos.Response::from).toList();
    }

    @PutMapping("/teacher-requests/{requestId}")
    @Transactional
    public TeacherRequestDtos.Response decideTeacherRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody TeacherRequestDtos.Decision decision) {
        TeacherRequest request = teacherRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher request not found."));
        if (request.getStatus() != TeacherRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been decided.");
        }
        TeacherRequestStatus status = parseRequestStatus(decision.status());
        if (status == TeacherRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision must be APPROVED or REJECTED.");
        }
        request.setStatus(status);
        request.setAdminNote(decision.adminNote());
        if (status == TeacherRequestStatus.APPROVED) {
            request.getUser().setRole(Role.TEACHER);
            userRepository.save(request.getUser());
        }
        return TeacherRequestDtos.Response.from(teacherRequestRepository.save(request));
    }

    @GetMapping("/courses")
    @Transactional(readOnly = true)
    public List<AdminDtos.CourseView> courses() {
        return courseRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(course -> AdminDtos.CourseView.from(course, enrollmentRepository.countByCourseId(course.getId())))
                .toList();
    }

    @PatchMapping("/courses/{courseId}/published")
    @Transactional
    public AdminDtos.CourseView setPublished(
            @PathVariable Long courseId,
            @RequestBody AdminDtos.PublishedUpdate update) {
        if (update.isPublished() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "isPublished is required.");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        course.setIsPublished(update.isPublished());
        course.setStatus(update.isPublished() ? CourseStatus.PUBLISHED : CourseStatus.PENDING);
        return AdminDtos.CourseView.from(courseRepository.save(course),
                enrollmentRepository.countByCourseId(course.getId()));
    }

    @PatchMapping("/courses/{courseId}/status")
    @Transactional
    public AdminDtos.CourseView setCourseStatus(
            @PathVariable Long courseId,
            @Valid @RequestBody AdminDtos.CourseStatusUpdate update) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        CourseStatus status;
        try {
            status = CourseStatus.valueOf(update.status().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid course status.", exception);
        }
        course.setStatus(status);
        course.setIsPublished(status == CourseStatus.PUBLISHED);
        return AdminDtos.CourseView.from(courseRepository.save(course),
                enrollmentRepository.countByCourseId(course.getId()));
    }

    @DeleteMapping("/courses/{courseId}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        try {
            courseRepository.delete(course);
            courseRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "This course has related enrollment or learning records and cannot be deleted.", exception);
        }
    }

    @GetMapping("/categories")
    @Transactional(readOnly = true)
    public List<AdminDtos.CategoryView> categories() {
        return categoryRepository.findAll().stream().map(AdminDtos.CategoryView::from).toList();
    }

    @PostMapping("/categories")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public AdminDtos.CategoryView createCategory(@Valid @RequestBody AdminDtos.CategoryInput input) {
        Category category = new Category();
        category.setName(input.name().trim());
        category.setSlug(input.slug().trim());
        category.setDescription(input.description());
        try {
            return AdminDtos.CategoryView.from(categoryRepository.save(category));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category slug already exists.", exception);
        }
    }

    @PutMapping("/categories/{categoryId}")
    @Transactional
    public AdminDtos.CategoryView updateCategory(
            @PathVariable Integer categoryId,
            @Valid @RequestBody AdminDtos.CategoryInput input) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found."));
        category.setName(input.name().trim());
        category.setSlug(input.slug().trim());
        category.setDescription(input.description());
        try {
            return AdminDtos.CategoryView.from(categoryRepository.save(category));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category slug already exists.", exception);
        }
    }

    @DeleteMapping("/categories/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Integer categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found.");
        }
        categoryRepository.deleteById(categoryId);
    }

    @PostMapping("/notifications")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public int sendNotification(
            @Valid @RequestBody AdminDtos.NotificationInput input,
            org.springframework.security.core.Authentication authentication,
            HttpServletRequest request) {
        String targetType = input.targetType() == null ? "ALL" : input.targetType().trim().toUpperCase(Locale.ROOT);
        List<User> recipients;
        if (input.userIds() != null && !input.userIds().isEmpty()) {
            recipients = userRepository.findAllById(input.userIds());
        } else if ("TEACHERS".equals(targetType)) {
            recipients = userRepository.findByRoleOrderByCreatedAtDesc(Role.TEACHER);
        } else if ("STUDENTS".equals(targetType)) {
            recipients = userRepository.findByRoleOrderByCreatedAtDesc(Role.STUDENT);
        } else if ("ALL".equals(targetType)) {
            recipients = userRepository.findAll();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid notification target.");
        }
        if (input.userIds() != null && !input.userIds().isEmpty()
                && recipients.size() != input.userIds().stream().distinct().count()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more recipients do not exist.");
        }
        User sender = userRepository.findByEmail(org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        List<Notification> notifications = recipients.stream().map(user -> {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setSender(sender);
            notification.setTargetRole(targetType);
            notification.setTitle(input.title().trim());
            notification.setMessage(input.message().trim());
            notification.setIsRead(false);
            return notification;
        }).toList();
        notificationRepository.saveAll(notifications);
        auditLogService.record(authentication, request, "Gửi thông báo", input.title().trim()
                + " (người nhận: " + notifications.size() + ")", "INFO");
        return notifications.size();
    }

    @GetMapping("/notifications")
    @Transactional(readOnly = true)
    public List<AdminDtos.NotificationView> notifications() {
        return notificationRepository.findTop300ByOrderByCreatedAtDesc().stream()
                .map(AdminDtos.NotificationView::from)
                .toList();
    }

    @PutMapping("/notifications/{notificationId}")
    @Transactional
    public AdminDtos.NotificationView updateNotification(
            @PathVariable Long notificationId,
            @Valid @RequestBody AdminDtos.NotificationUpdate input,
            org.springframework.security.core.Authentication authentication,
            HttpServletRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notification.setTitle(input.title().trim());
        notification.setMessage(input.message().trim());
        AdminDtos.NotificationView saved = AdminDtos.NotificationView.from(notificationRepository.save(notification));
        auditLogService.record(authentication, request, "Cập nhật thông báo", saved.title(), "INFO");
        return saved;
    }

    @DeleteMapping("/notifications/{notificationId}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotification(
            @PathVariable Long notificationId,
            org.springframework.security.core.Authentication authentication,
            HttpServletRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notificationRepository.delete(notification);
        auditLogService.record(authentication, request, "Xóa thông báo", notification.getTitle(), "WARNING");
    }

    @GetMapping("/moderation/reviews")
    @Transactional(readOnly = true)
    public List<AdminDtos.ReviewModeration> moderationReviews() {
        return reviewRepository.findAllWithDetails().stream().map(AdminDtos.ReviewModeration::from).toList();
    }

    @GetMapping("/moderation/lesson-comments")
    @Transactional(readOnly = true)
    public List<AdminDtos.CommentModeration> moderationComments() {
        return lessonCommentRepository.findAllForModeration().stream()
                .map(AdminDtos.CommentModeration::from).toList();
    }

    @DeleteMapping("/reviews/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found.");
        }
        reviewRepository.deleteById(reviewId);
    }

    @DeleteMapping("/lesson-comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLessonComment(@PathVariable Long commentId) {
        if (!lessonCommentRepository.existsById(commentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson comment not found.");
        }
        lessonCommentRepository.deleteById(commentId);
    }

    private Role parseRole(String value) {
        try {
            return Role.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role.", exception);
        }
    }

    private TeacherRequestStatus parseRequestStatus(String value) {
        try {
            return TeacherRequestStatus.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid teacher request status.", exception);
        }
    }
}
