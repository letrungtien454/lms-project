package lms_backend_core.repository;

import lms_backend_core.entity.LessonAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonAttachmentRepository extends JpaRepository<LessonAttachment, Long> {
    List<LessonAttachment> findAllByLessonIdOrderByIdAsc(Long lessonId);

    Optional<LessonAttachment> findByIdAndLessonId(Long id, Long lessonId);
}
