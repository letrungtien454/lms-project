package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.ChapterQuizDtos;
import lms_backend_core.service.ChapterQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/chapters/{chapterId}/summary-quiz/attempts")
@RequiredArgsConstructor
public class ChapterQuizController {

    private final ChapterQuizService chapterQuizService;

    @GetMapping("/availability")
    public ChapterQuizDtos.Availability availability(
            @PathVariable Long chapterId,
            Authentication authentication) {
        return chapterQuizService.availability(chapterId, authentication);
    }

    @PostMapping
    public ChapterQuizDtos.StartedAttempt start(
            @PathVariable Long chapterId,
            @Valid @RequestBody ChapterQuizDtos.StartRequest request,
            Authentication authentication) {
        return chapterQuizService.start(chapterId, request, authentication);
    }

    @GetMapping("/{attemptId}")
    public ChapterQuizDtos.AttemptStatus getAttempt(
            @PathVariable Long chapterId,
            @PathVariable Long attemptId,
            Authentication authentication) {
        return chapterQuizService.getAttempt(chapterId, attemptId, authentication);
    }

    @PutMapping("/{attemptId}/answers/{questionId}")
    public ChapterQuizDtos.AnswerResponse saveAnswer(
            @PathVariable Long chapterId,
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            @Valid @RequestBody ChapterQuizDtos.AnswerRequest request,
            Authentication authentication) {
        return chapterQuizService.saveAnswer(chapterId, attemptId, questionId, request, authentication);
    }

    @PostMapping("/{attemptId}/submit")
    public ChapterQuizDtos.Result submit(
            @PathVariable Long chapterId,
            @PathVariable Long attemptId,
            @Valid @RequestBody ChapterQuizDtos.SubmitRequest request,
            Authentication authentication) {
        return chapterQuizService.submit(chapterId, attemptId, request, authentication);
    }
}
