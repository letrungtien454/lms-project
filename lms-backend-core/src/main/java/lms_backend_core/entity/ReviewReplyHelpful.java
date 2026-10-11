package lms_backend_core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "review_reply_helpful",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_reply_helpful_user",
        columnNames = {"reply_id", "user_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
public class ReviewReplyHelpful {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reply_id", nullable = false)
    private ReviewReply reply;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public ReviewReplyHelpful(ReviewReply reply, User user) {
        this.reply = reply;
        this.user = user;
    }
}