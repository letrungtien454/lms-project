
package lms_backend_core.repository;

import lms_backend_core.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<Review> findByStudentIdAndCourseId(
        Long studentId,
        Long courseId
    );

    boolean existsByStudentIdAndCourseId(
        Long studentId,
        Long courseId
    );

    long countByCourseId(Long courseId);

    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.course.id = :courseId
          AND r.rating IS NOT NULL
        """)
    Double getAverageRating(@Param("courseId") Long courseId);

    @Query("""
        SELECT r.rating, COUNT(r)
        FROM Review r
        WHERE r.course.id = :courseId
          AND r.rating IS NOT NULL
        GROUP BY r.rating
        """)
    List<Object[]> getRatingDistribution(
        @Param("courseId") Long courseId
    );
}
