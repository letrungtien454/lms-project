package lms_backend_core.repository;

import lms_backend_core.entity.TeacherRequest;
import lms_backend_core.entity.TeacherRequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherRequestRepository extends JpaRepository<TeacherRequest, Long> {

    @EntityGraph(attributePaths = "user")
    List<TeacherRequest> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "user")
    List<TeacherRequest> findAllByStatusOrderByCreatedAtDesc(TeacherRequestStatus status);

    @EntityGraph(attributePaths = "user")
    Optional<TeacherRequest> findByUserId(Long userId);

    boolean existsByUserIdAndStatus(Long userId, TeacherRequestStatus status);
}
