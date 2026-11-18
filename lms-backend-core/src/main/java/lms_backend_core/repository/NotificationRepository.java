package lms_backend_core.repository;

import lms_backend_core.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findAllByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification> findAllByUserIdAndIsReadFalse(Long userId);
    List<Notification> findTop300ByOrderByCreatedAtDesc();
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
}
