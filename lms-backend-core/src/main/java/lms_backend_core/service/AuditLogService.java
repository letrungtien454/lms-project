package lms_backend_core.service;

import lms_backend_core.entity.AuditLog;
import lms_backend_core.entity.User;
import lms_backend_core.repository.AuditLogRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void record(
            Authentication authentication,
            HttpServletRequest request,
            String action,
            String target,
            String level) {
        User actor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found."));
        AuditLog entry = new AuditLog();
        entry.setActorName(actor.getFullName());
        entry.setActorRole(actor.getRole().name());
        entry.setAction(action);
        entry.setTarget(target);
        entry.setIpAddress(request.getRemoteAddr());
        entry.setLevel(level);
        auditLogRepository.save(entry);
    }
}
