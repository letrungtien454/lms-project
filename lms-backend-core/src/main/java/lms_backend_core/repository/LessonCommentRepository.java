package lms_backend_core.repository;

import lms_backend_core.entity.LessonComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonCommentRepository extends JpaRepository<LessonComment, Long> {
    @EntityGraph(attributePaths = {"user", "parent"})
    List<LessonComment> findAllByLessonIdOrderByCreatedAtAscIdAsc(Long lessonId);

    Optional<LessonComment> findByIdAndLessonId(Long id, Long lessonId);

    boolean existsByIdAndLessonId(Long id, Long lessonId);
}
