package lms_backend_core.repository;

import lms_backend_core.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findAllByStudentIdAndLessonChapterCourseId(Long studentId, Long courseId);
    Optional<LearningProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);
}
