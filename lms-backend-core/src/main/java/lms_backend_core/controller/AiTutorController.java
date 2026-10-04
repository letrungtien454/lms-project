package lms_backend_core.controller;

import lms_backend_core.service.GeminiService;
import lms_backend_core.service.LearningFlowService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
public class AiTutorController {

    private final GeminiService geminiService;
    private final LearningFlowService learningFlowService;

    @PostMapping("/chat")
    public ResponseEntity<AiTutorResponse> askAiTutor(
            @Valid @RequestBody AiTutorRequest request,
            Authentication authentication) {
        var lesson = learningFlowService.getLessonContext(request.lessonId(), authentication);
        if (request.courseId() != null && !request.courseId().equals(lesson.courseId())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(new AiTutorResponse(
                geminiService.askAiTutor(request.question().trim(), lesson)));
    }
}