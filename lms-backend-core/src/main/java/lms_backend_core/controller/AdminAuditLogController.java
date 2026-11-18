package lms_backend_core.controller;

import lms_backend_core.entity.AuditLog;
import lms_backend_core.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<LogView> logs() {
        return auditLogRepository.findTop500ByOrderByCreatedAtDesc().stream()
                .map(LogView::from)
                .toList();
    }

    public record LogView(
            Long id,
            String actorName,
            String actorRole,
            String action,
            String target,
            String ipAddress,
            String level,
            OffsetDateTime createdAt) {
        static LogView from(AuditLog log) {
            return new LogView(log.getId(), log.getActorName(), log.getActorRole(), log.getAction(),
                    log.getTarget(), log.getIpAddress(), log.getLevel(), log.getCreatedAt());
        }
    }
}
