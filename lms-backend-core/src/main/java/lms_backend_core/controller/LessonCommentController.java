package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.LessonCommentDtos;
import lms_backend_core.service.LessonCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LessonCommentController {

    private final LessonCommentService lessonCommentService;

    @GetMapping("/api/lessons/{lessonId}/comments")
    public List<LessonCommentDtos.Comment> getComments(
            @PathVariable Long lessonId,
            Authentication authentication) {
        return lessonCommentService.getComments(lessonId, authentication);
    }

    @PostMapping("/api/lessons/{lessonId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonCommentDtos.Comment createComment(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonCommentDtos.CreateRequest request,
            Authentication authentication) {
        return lessonCommentService.createComment(lessonId, request, authentication);
    }

    @PutMapping("/api/lessons/{lessonId}/comments/{commentId}/helpful")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markHelpful(
            @PathVariable Long lessonId,
            @PathVariable Long commentId,
            Authentication authentication) {
        lessonCommentService.markHelpful(lessonId, commentId, authentication);
    }

    @DeleteMapping("/api/lessons/{lessonId}/comments/{commentId}/helpful")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeHelpful(
            @PathVariable Long lessonId,
            @PathVariable Long commentId,
            Authentication authentication) {
        lessonCommentService.removeHelpful(lessonId, commentId, authentication);
    }
}
