package lms_backend_core.repository;

import lms_backend_core.entity.Roadmap;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);


    @EntityGraph(attributePaths = {"stages", "stages.course"})
    List<Roadmap> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = {"stages", "stages.course"})
    @Query("SELECT DISTINCT r FROM Roadmap r WHERE r.id = :id")
    Optional<Roadmap> findWithStagesById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Roadmap r WHERE r.id = :id")
    Optional<Roadmap> findByIdForUpdate(@Param("id") Long id);
}
