package lms_backend_core.repository;

import lms_backend_core.entity.Chapter;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    @EntityGraph(attributePaths = "lessons")
    List<Chapter> findByCourseIdOrderByOrderIndexAscIdAsc(Long courseId);
}
