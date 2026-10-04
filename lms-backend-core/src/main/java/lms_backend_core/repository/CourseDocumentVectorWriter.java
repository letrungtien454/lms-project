package lms_backend_core.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class CourseDocumentVectorWriter {

    private static final String INSERT_SQL = """
            INSERT INTO course_document_vectors
                (course_id, lesson_id, content_chunk, embedding, source_attachment_id, source_checksum, chunk_index)
            VALUES (?, ?, ?, CAST(? AS vector(1536)), ?, ?, ?)
            """;

    private final JdbcTemplate jdbcTemplate;

    public CourseDocumentVectorWriter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void replaceAttachmentChunks(
            Long courseId,
            Long lessonId,
            Long attachmentId,
            String checksum,
            List<IndexedChunk> chunks) {
        jdbcTemplate.update(
                "DELETE FROM course_document_vectors WHERE course_id = ? AND lesson_id = ? AND source_attachment_id = ?",
                courseId,
                lessonId,
                attachmentId);
        jdbcTemplate.batchUpdate(INSERT_SQL, chunks, chunks.size(), (statement, chunk) -> {
            statement.setLong(1, courseId);
            statement.setLong(2, lessonId);
            statement.setString(3, chunk.content());
            statement.setString(4, chunk.embedding());
            statement.setLong(5, attachmentId);
            statement.setString(6, checksum);
            statement.setInt(7, chunk.index());
        });
    }

    public record IndexedChunk(int index, String content, String embedding) {
    }
}
