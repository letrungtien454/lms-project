package lms_backend_core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonAlias;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email cannot be blank")
    @JsonAlias("username")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;
}