package lms_backend_core.repository;

import lms_backend_core.entity.UserRoadmap;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRoadmapRepository extends JpaRepository<UserRoadmap, Long> {
    boolean existsByStudentIdAndRoadmapId(Long studentId, Long roadmapId);
    Optional<UserRoadmap> findByStudentIdAndRoadmapId(Long studentId, Long roadmapId);
    List<UserRoadmap> findAllByStudentId(Long studentId);
    void deleteAllByRoadmapId(Long roadmapId);
}
