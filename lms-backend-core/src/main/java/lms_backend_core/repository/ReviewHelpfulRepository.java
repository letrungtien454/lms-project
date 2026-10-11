
package lms_backend_core.repository;

import lms_backend_core.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewHelpfulRepository
        extends JpaRepository<ReviewHelpful, Long> {

    boolean existsByReview_IdAndUser_Id(Long reviewId, Long userId);

    long countByReview_Id(Long reviewId);

    void deleteByReview_IdAndUser_Id(Long reviewId, Long userId);
}
