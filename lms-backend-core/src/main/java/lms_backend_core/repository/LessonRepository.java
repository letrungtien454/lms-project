package lms_backend_core.repository;

import lms_backend_core.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    Optional<Lesson> findByIdAndChapterCourseId(Long id, Long courseId);
}
