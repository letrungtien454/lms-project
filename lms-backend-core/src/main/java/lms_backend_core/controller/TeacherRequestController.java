package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.TeacherRequestDtos;
import lms_backend_core.entity.Role;
import lms_backend_core.entity.TeacherRequest;
import lms_backend_core.entity.TeacherRequestStatus;
import lms_backend_core.entity.User;
import lms_backend_core.repository.TeacherRequestRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/teacher-requests")
@RequiredArgsConstructor
public class TeacherRequestController {

    private final TeacherRequestRepository teacherRequestRepository;
    private final UserRepository userRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<TeacherRequestDtos.Response> submit(
            @Valid @RequestBody TeacherRequestDtos.Submission submission,
            Authentication authentication) {
        User user = currentUser(authentication);
        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only students can request teacher access.");
        }
        TeacherRequest request = teacherRequestRepository.findByUserId(user.getId()).orElseGet(TeacherRequest::new);
        if (request.getStatus() == TeacherRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A teacher request is already pending.");
        }
        request.setUser(user);
        request.setBio(submission.bio());
        request.setExperience(submission.experience());
        request.setCvUrl(submission.cvUrl());
        request.setAdminNote(null);
        request.setStatus(TeacherRequestStatus.PENDING);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TeacherRequestDtos.Response.from(teacherRequestRepository.save(request)));
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<TeacherRequestDtos.Response> getMyRequest(Authentication authentication) {
        User user = currentUser(authentication);
        return teacherRequestRepository.findByUserId(user.getId())
                .map(TeacherRequestDtos.Response::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }
}
