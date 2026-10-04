package lms_backend_core.repository;

import lms_backend_core.entity.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByIsPublishedTrue();

    // Fetch chapters here; lessons use subselect fetching to avoid multiple bag joins.
    @EntityGraph(attributePaths = {"chapters"})
    Optional<Course> findWithDetailsById(Long id);
}