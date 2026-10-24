package lms_backend_core.config;

import lms_backend_core.entity.Role;
import lms_backend_core.entity.User;
import lms_backend_core.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SuperAdminInitializerTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

    @Test
    void resetFlagChangesPasswordOnlyForMatchingExistingAdmin() {
        User admin = User.builder()
                .email("admin@example.com")
                .password("old-hash")
                .fullName("Admin")
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");
        SuperAdminInitializer initializer = initializer("admin@example.com", "new-password", true);

        initializer.run();

        assertEquals("new-hash", admin.getPassword());
        verify(userRepository).save(admin);
    }

    @Test
    void resetFlagRefusesToChangeNonAdminPassword() {
        User student = User.builder()
                .email("admin@example.com")
                .password("old-hash")
                .fullName("Student")
                .role(Role.STUDENT)
                .isActive(true)
                .build();
        when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(student));
        SuperAdminInitializer initializer = initializer("admin@example.com", "new-password", true);

        assertThrows(IllegalStateException.class, initializer::run);
    }

    private SuperAdminInitializer initializer(String email, String password, boolean reset) {
        SuperAdminInitializer initializer = new SuperAdminInitializer(userRepository, passwordEncoder);
        ReflectionTestUtils.setField(initializer, "adminEmail", email);
        ReflectionTestUtils.setField(initializer, "adminPassword", password);
        ReflectionTestUtils.setField(initializer, "resetAdminPassword", reset);
        return initializer;
    }
}
