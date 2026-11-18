package lms_backend_core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lms_backend_core.entity.SystemSetting;

public final class SystemSettingDtos {

    private SystemSettingDtos() {
    }

    public record Settings(
            @NotBlank String siteName,
            @NotBlank @Email String supportEmail,
            boolean maintenanceMode,
            boolean allowRegistration,
            boolean autoApproveCourses,
            boolean autoApproveTeachers,
            @Min(0) @Max(100) int platformCommission,
            @Min(0) long minCoursePrice) {
        public static Settings from(SystemSetting setting) {
            return new Settings(
                    setting.getSiteName(),
                    setting.getSupportEmail(),
                    setting.isMaintenanceMode(),
                    setting.isAllowRegistration(),
                    setting.isAutoApproveCourses(),
                    setting.isAutoApproveTeachers(),
                    setting.getPlatformCommission(),
                    setting.getMinCoursePrice());
        }

        public void applyTo(SystemSetting setting) {
            setting.setSiteName(siteName.trim());
            setting.setSupportEmail(supportEmail.trim());
            setting.setMaintenanceMode(maintenanceMode);
            setting.setAllowRegistration(allowRegistration);
            setting.setAutoApproveCourses(autoApproveCourses);
            setting.setAutoApproveTeachers(autoApproveTeachers);
            setting.setPlatformCommission(platformCommission);
            setting.setMinCoursePrice(minCoursePrice);
        }
    }
}
