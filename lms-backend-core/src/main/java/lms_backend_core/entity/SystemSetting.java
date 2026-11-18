package lms_backend_core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
public class SystemSetting {

    @Id
    private Long id = 1L;

    @Column(name = "site_name", nullable = false)
    private String siteName = "EduFlow LMS";

    @Column(name = "support_email", nullable = false)
    private String supportEmail = "support@eduflow.vn";

    @Column(name = "maintenance_mode", nullable = false)
    private boolean maintenanceMode;

    @Column(name = "allow_registration", nullable = false)
    private boolean allowRegistration = true;

    @Column(name = "auto_approve_courses", nullable = false)
    private boolean autoApproveCourses;

    @Column(name = "auto_approve_teachers", nullable = false)
    private boolean autoApproveTeachers;

    @Column(name = "platform_commission", nullable = false)
    private int platformCommission = 15;

    @Column(name = "min_course_price", nullable = false)
    private long minCoursePrice = 50000;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    protected void updateTimestamp() {
        updatedAt = OffsetDateTime.now();
    }
}
