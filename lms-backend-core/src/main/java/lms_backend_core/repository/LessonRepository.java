package lms_backend_core.repository;

import lms_backend_core.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    interface CourseDurationSummary {
        Long getCourseId();
        Long getTotalDurationSeconds();
    }

    Optional<Lesson> findByIdAndChapterCourseId(Long id, Long courseId);
    List<Lesson> findByChapterIdOrderByOrderIndexAscIdAsc(Long chapterId);
    long countByChapterCourseId(Long courseId);

    @Query("""
            SELECT lesson.chapter.course.id AS courseId,
                   COALESCE(SUM(lesson.durationSeconds), 0) AS totalDurationSeconds
            FROM Lesson lesson
            GROUP BY lesson.chapter.course.id
            """)
    List<CourseDurationSummary> sumDurationSecondsByCourse();

    @Query("""
            SELECT COALESCE(SUM(lesson.durationSeconds), 0)
            FROM Lesson lesson
            WHERE lesson.chapter.course.id = :courseId
            """)
    long sumDurationSecondsByCourseId(@Param("courseId") Long courseId);

    @Query("""
            SELECT lesson.chapter.course.id AS courseId, COUNT(lesson.id) AS lessonCount
            FROM Lesson lesson
            WHERE lesson.chapter.course.teacher.id = :teacherId
            GROUP BY lesson.chapter.course.id
            """)
    List<CourseLessonCount> countByTeacher(@Param("teacherId") Long teacherId);

    interface CourseLessonCount {
        Long getCourseId();
        long getLessonCount();
    }
}
