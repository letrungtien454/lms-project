package lms_backend_core.config;

import lms_backend_core.entity.Role;
import lms_backend_core.entity.User;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class SuperAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.admin.email:}")
    private String adminEmail;

    @Value("${bootstrap.admin.password:}")
    private String adminPassword;

    @Value("${bootstrap.admin.full-name:Super Admin}")
    private String adminFullName;

    @Value("${bootstrap.admin.reset-password:false}")
    private boolean resetAdminPassword;

    @Override
    public void run(String... args) {
        if (resetAdminPassword) {
            resetExistingAdminPassword();
            return;
        }
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            throw new IllegalStateException(
                    "No ADMIN account exists. Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create one.");
        }
        String normalizedEmail = adminEmail.trim().toLowerCase(java.util.Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_EMAIL is already assigned to a non-admin user: " + normalizedEmail);
        }

        userRepository.save(User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(adminPassword))
                .fullName(adminFullName)
                .role(Role.ADMIN)
                .isActive(true)
                .build());
    }

    private void resetExistingAdminPassword() {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            throw new IllegalStateException(
                    "Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to reset an existing Admin password.");
        }

        String normalizedEmail = adminEmail.trim().toLowerCase(java.util.Locale.ROOT);
        User admin = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalStateException(
                        "No existing account matches BOOTSTRAP_ADMIN_EMAIL; refusing to reset another account."));
        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_EMAIL does not belong to an ADMIN account; refusing to change its password.");
        }

        admin.setPassword(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
    }
}
