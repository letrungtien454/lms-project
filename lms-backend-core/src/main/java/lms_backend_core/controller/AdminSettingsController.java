package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.SystemSettingDtos;
import lms_backend_core.entity.SystemSetting;
import lms_backend_core.repository.SystemSettingRepository;
import lms_backend_core.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SystemSettingRepository settingsRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    @Transactional
    public SystemSettingDtos.Settings getSettings() {
        return SystemSettingDtos.Settings.from(loadSettings());
    }

    @PutMapping
    @Transactional
    public SystemSettingDtos.Settings updateSettings(
            @Valid @RequestBody SystemSettingDtos.Settings input,
            Authentication authentication,
            HttpServletRequest request) {
        SystemSetting settings = loadSettings();
        input.applyTo(settings);
        SystemSettingDtos.Settings saved = SystemSettingDtos.Settings.from(settingsRepository.save(settings));
        auditLogService.record(authentication, request, "Cập nhật cấu hình hệ thống", "System settings", "INFO");
        return saved;
    }

    private SystemSetting loadSettings() {
        return settingsRepository.findById(1L).orElseGet(() -> settingsRepository.save(new SystemSetting()));
    }
}
