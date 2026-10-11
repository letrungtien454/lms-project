package lms_backend_core.repository;

import lms_backend_core.entity.ReviewReplyHelpful;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewReplyHelpfulRepository extends JpaRepository<ReviewReplyHelpful, Long> {
    boolean existsByReply_IdAndUser_Id(Long replyId, Long userId);
    void deleteByReply_IdAndUser_Id(Long replyId, Long userId);
    long countByReply_Id(Long replyId);
}