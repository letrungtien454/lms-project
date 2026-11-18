package lms_backend_core.controller;

import lms_backend_core.dto.TeacherDtos;
import lms_backend_core.entity.Notification;
import lms_backend_core.entity.User;
import lms_backend_core.repository.NotificationRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<TeacherDtos.NotificationView> notifications(Authentication authentication) {
        User user = currentUser(authentication);
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(TeacherDtos.NotificationView::from)
                .toList();
    }

    @GetMapping("/page")
    @Transactional(readOnly = true)
    public Page<TeacherDtos.NotificationView> notificationPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Authentication authentication) {
        if (page < 0 || size < 1 || size > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid page or size.");
        }
        User user = currentUser(authentication);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var notifications = unreadOnly
                ? notificationRepository.findAllByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId(), pageable)
                : notificationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return notifications.map(TeacherDtos.NotificationView::from);
    }

    @GetMapping("/unread-count")
    @Transactional(readOnly = true)
    public long unreadCount(Authentication authentication) {
        return notificationRepository.countByUserIdAndIsReadFalse(currentUser(authentication).getId());
    }

    @PatchMapping("/{notificationId}/read")
    @Transactional
    public TeacherDtos.NotificationView markRead(
            @PathVariable Long notificationId,
            Authentication authentication) {
        User user = currentUser(authentication);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notification.setIsRead(true);
        return TeacherDtos.NotificationView.from(notificationRepository.save(notification));
    }

    @PatchMapping("/read-all")
    @Transactional
    public long markAllRead(Authentication authentication) {
        User user = currentUser(authentication);
        List<Notification> unread = notificationRepository.findAllByUserIdAndIsReadFalse(user.getId());
        unread.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }
}
