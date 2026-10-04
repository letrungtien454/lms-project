package lms_backend_core.repository;

import lms_backend_core.entity.Quiz;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    @EntityGraph(attributePaths = "questions")
    Optional<Quiz> findByLessonId(Long lessonId);
}
