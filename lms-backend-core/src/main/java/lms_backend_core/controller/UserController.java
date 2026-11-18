package lms_backend_core.controller;

import lms_backend_core.entity.User;
import lms_backend_core.dto.UserResponse;
import lms_backend_core.config.UploadResourceConfig;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UploadResourceConfig uploadResourceConfig;

    @Value("${app.upload-max-bytes:10485760}")
    private long maximumUploadBytes;

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(UserResponse.from(currentUser(authentication)));
    }

    @PutMapping("/me")
    @Transactional
    public UserResponse updateProfile(
            @Valid @RequestBody ProfileUpdate input,
            Authentication authentication) {
        User user = currentUser(authentication);
        user.setFullName(input.fullName().trim());
        user.setAvatarUrl(input.avatarUrl());
        return UserResponse.from(userRepository.save(user));
    }

    @PostMapping("/change-password")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @Valid @RequestBody PasswordUpdate input,
            Authentication authentication) {
        User user = currentUser(authentication);
        if (!passwordEncoder.matches(input.currentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác.");
        }
        user.setPassword(passwordEncoder.encode(input.newPassword()));
        userRepository.save(user);
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<UploadResponse> uploadProfileImage(@RequestPart("file") MultipartFile file) {
        if (file.isEmpty() || file.getSize() > Math.min(maximumUploadBytes, 5 * 1024 * 1024L)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh đại diện phải có dung lượng tối đa 5MB.");
        }
        String contentType = file.getContentType();
        String extension = switch (contentType == null ? "" : contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chấp nhận ảnh PNG, JPEG hoặc WebP.");
        };

        try {
            byte[] bytes = file.getBytes();
            if (!hasValidImageSignature(bytes, extension)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tệp tải lên không phải ảnh hợp lệ.");
            }
            Path directory = uploadResourceConfig.getUploadDirectory().resolve("profile").normalize();
            Files.createDirectories(directory);
            String filename = UUID.randomUUID() + extension;
            Files.copy(new java.io.ByteArrayInputStream(bytes), directory.resolve(filename));
            return ResponseEntity.status(HttpStatus.CREATED).body(new UploadResponse("/uploads/profile/" + filename));
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh đại diện.", exception);
        }
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    private boolean hasValidImageSignature(byte[] bytes, String extension) {
        if (extension.equals(".png")) {
            return bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == 'P'
                    && bytes[2] == 'N' && bytes[3] == 'G';
        }
        if (extension.equals(".jpg")) {
            return bytes.length >= 3 && bytes[0] == (byte) 0xff && bytes[1] == (byte) 0xd8
                    && bytes[2] == (byte) 0xff;
        }
        return bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I'
                && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
    }

    public record ProfileUpdate(@NotBlank @Size(max = 100) String fullName, String avatarUrl) {
    }

    public record PasswordUpdate(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6) String newPassword) {
    }

    public record UploadResponse(String fileUrl) {
    }
}