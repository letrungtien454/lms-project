package lms_backend_core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chapter_quiz_attempt_questions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_chapter_quiz_attempt_question",
                columnNames = {"attempt_id", "question_id"}),
        @UniqueConstraint(name = "uq_chapter_quiz_attempt_position",
                columnNames = {"attempt_id", "position"})
})
@Getter
@Setter
@NoArgsConstructor
public class ChapterQuizAttemptQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ChapterQuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionBank question;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "selected_option", length = 10)
    private String selectedOption;

    @Column(name = "is_correct")
    private Boolean isCorrect;
}
