package lms_backend_core.repository;

import lms_backend_core.entity.LessonCommentHelpfulVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface LessonCommentHelpfulVoteRepository extends JpaRepository<LessonCommentHelpfulVote, Long> {

    @Query(value = """
            SELECT comment_id AS "commentId",
                   COUNT(*) AS "helpfulCount",
                   BOOL_OR(user_id = :userId) AS "helpfulByCurrentUser"
            FROM lesson_comment_helpful_votes
            WHERE comment_id IN (:commentIds)
            GROUP BY comment_id
            """, nativeQuery = true)
    List<HelpfulSummary> findHelpfulSummaries(
            @Param("commentIds") List<Long> commentIds,
            @Param("userId") Long userId);

    Optional<LessonCommentHelpfulVote> findByCommentIdAndUserId(Long commentId, Long userId);

    @Modifying
    @Transactional
    void deleteByCommentIdAndUserId(Long commentId, Long userId);

    interface HelpfulSummary {
        Long getCommentId();
        Long getHelpfulCount();
        Boolean getHelpfulByCurrentUser();
    }
}
