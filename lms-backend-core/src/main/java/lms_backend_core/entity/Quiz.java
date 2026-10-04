package lms_backend_core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", unique = true)
    private Lesson lesson;

    @Column(nullable = false)
    private String title;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes = 15;

    @Column(name = "pass_score")
    private Integer passScore = 80;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "quiz_questions",
            joinColumns = @JoinColumn(name = "quiz_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id"))
    @OrderBy("id ASC")
    private List<QuestionBank> questions;
}
