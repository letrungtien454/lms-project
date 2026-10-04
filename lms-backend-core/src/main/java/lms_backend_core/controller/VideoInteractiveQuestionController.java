package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.VideoInteractiveQuestionDtos;
import lms_backend_core.service.VideoInteractiveQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class VideoInteractiveQuestionController {

    private final VideoInteractiveQuestionService interactiveQuestionService;

    @GetMapping("/api/lessons/{lessonId}/interactive-questions")
    public VideoInteractiveQuestionDtos.LessonQuestions getQuestions(
            @PathVariable Long lessonId,
            Authentication authentication) {
        return interactiveQuestionService.getQuestions(lessonId, authentication);
    }

    @PostMapping("/api/lessons/{lessonId}/interactive-questions/{questionId}/answer")
    public VideoInteractiveQuestionDtos.AnswerResult submitAnswer(
            @PathVariable Long lessonId,
            @PathVariable Long questionId,
            @Valid @RequestBody VideoInteractiveQuestionDtos.AnswerSubmission submission,
            Authentication authentication) {
        return interactiveQuestionService.submitAnswer(lessonId, questionId, submission, authentication);
    }
}
