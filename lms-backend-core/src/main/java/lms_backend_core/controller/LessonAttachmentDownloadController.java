package lms_backend_core.controller;

import lms_backend_core.config.UploadedFileResolver;
import lms_backend_core.entity.LessonAttachment;
import lms_backend_core.repository.LessonAttachmentRepository;
import lms_backend_core.service.LearningFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequiredArgsConstructor
public class LessonAttachmentDownloadController {

    private final LessonAttachmentRepository attachmentRepository;
    private final LearningFlowService learningFlowService;
    private final UploadedFileResolver uploadedFileResolver;

    @GetMapping("/api/lessons/{lessonId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long lessonId,
            @PathVariable Long attachmentId,
            @RequestParam(defaultValue = "false") boolean inline,
            Authentication authentication) {
        learningFlowService.getAccessibleLesson(lessonId, authentication);
        LessonAttachment attachment = attachmentRepository.findByIdAndLessonId(attachmentId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attachment not found."));

        Path file = uploadedFileResolver.resolve(attachment.getFileUrl());
        if (!Files.isRegularFile(file)) {
            throw new ResponseStatusException(NOT_FOUND, "Attachment file not found.");
        }

        Resource resource = new FileSystemResource(file);
        boolean isPdf = attachment.getFileType() == LessonAttachment.FileType.PDF
                || attachment.getFileName().toLowerCase(java.util.Locale.ROOT).endsWith(".pdf");
        return ResponseEntity.ok()
                .contentType(isPdf ? MediaType.APPLICATION_PDF : MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, (inline && isPdf
                        ? ContentDisposition.inline()
                        : ContentDisposition.attachment())
                        .filename(attachment.getFileName(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(resource);
    }
}
