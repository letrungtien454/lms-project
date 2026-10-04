package lms_backend_core.repository;

import lms_backend_core.entity.VideoInteractiveQuestion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoInteractiveQuestionRepository extends JpaRepository<VideoInteractiveQuestion, Long> {

    @EntityGraph(attributePaths = "question")
    List<VideoInteractiveQuestion> findAllByLessonIdOrderByVideoTimestampAscIdAsc(Long lessonId);

    @EntityGraph(attributePaths = "question")
    Optional<VideoInteractiveQuestion> findByIdAndLessonId(Long id, Long lessonId);
}
