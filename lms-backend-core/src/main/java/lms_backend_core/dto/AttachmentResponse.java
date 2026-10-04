package lms_backend_core.dto;

import lms_backend_core.entity.LessonAttachment;

public record AttachmentResponse(
        Long id,
        String fileName,
        String fileUrl,
        String fileType,
        Long fileSizeBytes) {

    public static AttachmentResponse from(LessonAttachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFileUrl(),
                attachment.getFileType().name(),
                attachment.getFileSizeBytes());
    }
}
