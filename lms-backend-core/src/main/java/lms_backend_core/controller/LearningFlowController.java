package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.AttachmentResponse;
import lms_backend_core.dto.ProgressResponse;
import lms_backend_core.dto.ProgressUpdateRequest;
import lms_backend_core.dto.QuizDtos;
import lms_backend_core.service.LearningFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LearningFlowController {

    private final LearningFlowService learningFlowService;

    @GetMapping("/api/courses/{courseId}/progress")
    public List<ProgressResponse> getCourseProgress(
            @PathVariable Long courseId,
            Authentication authentication) {
        return learningFlowService.getProgress(courseId, authentication);
    }

    @PutMapping("/api/lessons/{lessonId}/progress")
    public ProgressResponse updateProgress(
            @PathVariable Long lessonId,
            @Valid @RequestBody ProgressUpdateRequest request,
            Authentication authentication) {
        return learningFlowService.updateProgress(lessonId, request, authentication);
    }

    @GetMapping("/api/lessons/{lessonId}/attachments")
    public List<AttachmentResponse> getLessonAttachments(
            @PathVariable Long lessonId,
            Authentication authentication) {
        return learningFlowService.getAttachments(lessonId, authentication);
    }

    @GetMapping("/api/lessons/{lessonId}/quiz")
    public ResponseEntity<QuizDtos.Quiz> getQuiz(
            @PathVariable Long lessonId,
            Authentication authentication) {
        return learningFlowService.getQuiz(lessonId, authentication)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/api/lessons/{lessonId}/quiz/submit")
    public QuizDtos.Result submitQuiz(
            @PathVariable Long lessonId,
            @Valid @RequestBody QuizDtos.Submission submission,
            Authentication authentication) {
        return learningFlowService.submitQuiz(lessonId, submission, authentication);
    }
}
