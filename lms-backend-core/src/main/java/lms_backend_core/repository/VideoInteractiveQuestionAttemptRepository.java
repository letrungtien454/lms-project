package lms_backend_core.repository;

import lms_backend_core.entity.VideoInteractiveQuestionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoInteractiveQuestionAttemptRepository
        extends JpaRepository<VideoInteractiveQuestionAttempt, Long> {

    Optional<VideoInteractiveQuestionAttempt> findByStudentIdAndInteractiveQuestionId(
            Long studentId,
            Long interactiveQuestionId);

    boolean existsByStudentIdAndInteractiveQuestionId(Long studentId, Long interactiveQuestionId);

    boolean existsByStudentIdAndInteractiveQuestionIdAndIsCorrectTrue(
            Long studentId,
            Long interactiveQuestionId);
}
