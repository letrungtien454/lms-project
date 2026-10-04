package lms_backend_core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "video_interactive_question_attempts", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "video_interactive_question_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class VideoInteractiveQuestionAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_interactive_question_id", nullable = false)
    private VideoInteractiveQuestion interactiveQuestion;

    @Column(name = "selected_option", nullable = false, length = 10)
    private String selectedOption;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "answered_at")
    private OffsetDateTime answeredAt;

    @PrePersist
    @PreUpdate
    protected void updateTimestamp() {
        answeredAt = OffsetDateTime.now();
    }
}
