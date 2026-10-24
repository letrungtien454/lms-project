package lms_backend_core.repository;

import lms_backend_core.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    Optional<Lesson> findByIdAndChapterCourseId(Long id, Long courseId);
    List<Lesson> findByChapterIdOrderByOrderIndexAscIdAsc(Long chapterId);

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
