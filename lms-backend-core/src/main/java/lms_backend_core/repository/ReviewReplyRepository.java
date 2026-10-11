
package lms_backend_core.repository;

import lms_backend_core.entity.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewReplyRepository
        extends JpaRepository<ReviewReply, Long> {

    List<ReviewReply> findByReview_IdOrderByCreatedAtAsc(Long reviewId);
}
