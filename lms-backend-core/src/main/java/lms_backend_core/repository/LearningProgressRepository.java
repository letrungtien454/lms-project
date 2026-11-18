package lms_backend_core.repository;

import lms_backend_core.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findAllByStudentIdAndLessonChapterCourseId(Long studentId, Long courseId);
    Optional<LearningProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);
    long countByStudentIdAndLessonChapterCourseIdAndStatus(
            Long studentId, Long courseId, LearningProgress.Status status);

    @Query("""
            SELECT lp.student.id AS studentId, lp.lesson.chapter.course.id AS courseId, COUNT(lp.id) AS completedCount
            FROM LearningProgress lp
            WHERE lp.lesson.chapter.course.teacher.id = :teacherId
              AND lp.status = :status
            GROUP BY lp.student.id, lp.lesson.chapter.course.id
            """)
    List<CompletedProgressCount> countByTeacherAndStatus(
            @Param("teacherId") Long teacherId,
            @Param("status") LearningProgress.Status status);

    interface CompletedProgressCount {
        Long getStudentId();
        Long getCourseId();
        long getCompletedCount();
    }
}
