package lms_backend_core.service;

import lms_backend_core.config.UploadedFileResolver;
import lms_backend_core.entity.LessonAttachment;
import lms_backend_core.repository.CourseDocumentVectorRepository;
import lms_backend_core.repository.CourseDocumentVectorWriter;
import lms_backend_core.repository.LessonAttachmentRepository;
import lms_backend_core.service.LearningFlowService.LessonContext;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LessonDocumentIndexService {

    private static final int EMBEDDING_BATCH_SIZE = 100;

    private final LessonAttachmentRepository attachmentRepository;
    private final UploadedFileResolver uploadedFileResolver;
    private final CourseDocumentVectorRepository vectorRepository;
    private final CourseDocumentVectorWriter vectorWriter;
    private final GeminiEmbeddingService embeddingService;

    public void indexLessonDocuments(LessonContext lesson) {
        for (LessonAttachment attachment : attachmentRepository.findAllByLessonIdOrderByIdAsc(lesson.lessonId())) {
            if (!isPdf(attachment)) continue;
            indexAttachment(lesson, attachment);
        }
    }

    private void indexAttachment(LessonContext lesson, LessonAttachment attachment) {
        Path file = uploadedFileResolver.resolve(attachment.getFileUrl());
        if (!Files.isRegularFile(file)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "PDF attachment file not found: " + attachment.getFileName());
        }

        String checksum = checksum(file);
        if (vectorRepository.hasEmbeddedAttachment(
                lesson.courseId(), lesson.lessonId(), attachment.getId(), checksum)) {
            return;
        }

        List<String> chunks = DocumentTextChunker.split(extractText(file));
        if (chunks.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "PDF contains no selectable text: " + attachment.getFileName());
        }

        List<CourseDocumentVectorWriter.IndexedChunk> indexedChunks = new ArrayList<>(chunks.size());
        for (int offset = 0; offset < chunks.size(); offset += EMBEDDING_BATCH_SIZE) {
            int end = Math.min(offset + EMBEDDING_BATCH_SIZE, chunks.size());
            List<String> batch = chunks.subList(offset, end);
            List<String> embeddings = embeddingService.getEmbeddings(batch);
            for (int index = 0; index < batch.size(); index++) {
                indexedChunks.add(new CourseDocumentVectorWriter.IndexedChunk(
                        offset + index,
                        batch.get(index),
                        embeddings.get(index)));
            }
        }

        vectorWriter.replaceAttachmentChunks(
                lesson.courseId(),
                lesson.lessonId(),
                attachment.getId(),
                checksum,
                indexedChunks);
    }

    private String extractText(Path file) {
        try (PDDocument document = Loader.loadPDF(file.toFile())) {
            return new PDFTextStripper().getText(document);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "Unable to extract text from the PDF attachment.");
        }
    }

    private String checksum(Path file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream input = Files.newInputStream(file)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = input.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read the PDF attachment.");
        }
    }

    private boolean isPdf(LessonAttachment attachment) {
        return attachment.getFileType() == LessonAttachment.FileType.PDF
                || attachment.getFileName().toLowerCase(Locale.ROOT).endsWith(".pdf")
                || attachment.getFileUrl().toLowerCase(Locale.ROOT).endsWith(".pdf");
    }
}
