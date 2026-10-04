package lms_backend_core.service;

import lms_backend_core.dto.AuthResponse;
import lms_backend_core.dto.LoginRequest;
import lms_backend_core.dto.RegisterRequest;
import lms_backend_core.entity.Role;
import lms_backend_core.entity.User;
import lms_backend_core.repository.UserRepository;
import lms_backend_core.security.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    @Value("${google.client-id:}")
    private String googleClientId;

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT) // Luôn gắn mặc định STUDENT ở Backend
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return createAuthResponse(user, token);
    }

    public AuthResponse loginWithGoogle(String credential) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
        }

        GoogleIdToken googleIdToken;
        try {
            googleIdToken = googleIdTokenVerifier.verify(credential);
        } catch (GeneralSecurityException | IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not verify Google credential", exception);
        }

        if (googleIdToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
        }

        Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail();
        String subject = payload.getSubject();
        if (!Boolean.TRUE.equals(payload.getEmailVerified())
                || email == null
                || email.isBlank()
                || subject == null
                || subject.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account email is not verified");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String fullName = (String) payload.get("name");
            if (fullName == null || fullName.isBlank()) {
                fullName = email.substring(0, email.indexOf('@'));
            }

            User newUser = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .avatarUrl((String) payload.get("picture"))
                    .role(Role.STUDENT)
                    .build();
            return userRepository.save(newUser);
        });

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return createAuthResponse(user, token);
    }

    private AuthResponse createAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}