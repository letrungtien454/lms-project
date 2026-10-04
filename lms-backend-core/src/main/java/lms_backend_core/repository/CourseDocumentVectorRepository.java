package lms_backend_core.repository;

import lms_backend_core.entity.CourseDocumentVector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CourseDocumentVectorRepository extends JpaRepository<CourseDocumentVector, Long> {

    @Query(value = "SELECT EXISTS (SELECT 1 FROM course_document_vectors " +
                   "WHERE course_id = :courseId AND lesson_id = :lessonId AND embedding IS NOT NULL)",
           nativeQuery = true)
    boolean hasEmbeddedChunks(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM course_document_vectors " +
                   "WHERE course_id = :courseId AND lesson_id = :lessonId " +
                   "AND source_attachment_id = :attachmentId AND source_checksum = :checksum " +
                   "AND embedding IS NOT NULL)",
           nativeQuery = true)
    boolean hasEmbeddedAttachment(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("attachmentId") Long attachmentId,
            @Param("checksum") String checksum);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM course_document_vectors " +
                   "WHERE course_id = :courseId AND lesson_id = :lessonId " +
                   "AND source_attachment_id = :attachmentId",
           nativeQuery = true)
    void deleteAttachmentChunks(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("attachmentId") Long attachmentId);

    @Query(value = "SELECT * FROM course_document_vectors v " +
                   "WHERE v.course_id = :courseId AND v.lesson_id = :lessonId AND v.embedding IS NOT NULL " +
                   "ORDER BY v.embedding <=> CAST(:queryVector AS vector(1536)) LIMIT :limit",
           nativeQuery = true)
    List<CourseDocumentVector> findTopSimilarDocumentsForLesson(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("queryVector") String queryVector,
            @Param("limit") int limit);
}