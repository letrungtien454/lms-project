package lms_backend_core.dto;

import lms_backend_core.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String email;
    private Role role;
}