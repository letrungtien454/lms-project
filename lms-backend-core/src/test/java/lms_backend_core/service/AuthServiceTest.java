package lms_backend_core.service;

import lms_backend_core.dto.AuthResponse;
import lms_backend_core.dto.LoginRequest;
import lms_backend_core.entity.Role;
import lms_backend_core.entity.User;
import lms_backend_core.repository.UserRepository;
import lms_backend_core.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtTokenProvider jwtTokenProvider = mock(JwtTokenProvider.class);
    private final GoogleIdTokenVerifier googleIdTokenVerifier = mock(GoogleIdTokenVerifier.class);
    private final AuthService service = new AuthService(
            userRepository, passwordEncoder, jwtTokenProvider, googleIdTokenVerifier);

    @Test
    void unknownEmailReturnsUnauthorizedInsteadOfInternalServerError() {
        LoginRequest request = loginRequest("  ADMIN@Example.COM ", "secret");
        when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.login(request));

        assertEquals(401, exception.getStatusCode().value());
        verify(userRepository).findByEmailIgnoreCase("admin@example.com");
    }

    @Test
    void successfulTeacherLoginPreservesRole() {
        LoginRequest request = loginRequest(" Teacher@Example.com ", "secret");
        User teacher = User.builder()
                .email("teacher@example.com")
                .fullName("Teacher")
                .password("encoded")
                .role(Role.TEACHER)
                .isActive(true)
                .build();
        when(userRepository.findByEmailIgnoreCase("teacher@example.com")).thenReturn(Optional.of(teacher));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(true);
        when(jwtTokenProvider.generateToken("teacher@example.com", "TEACHER")).thenReturn("signed-token");

        AuthResponse response = service.login(request);

        assertEquals("signed-token", response.getToken());
        assertEquals(Role.TEACHER, response.getRole());
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }
}
