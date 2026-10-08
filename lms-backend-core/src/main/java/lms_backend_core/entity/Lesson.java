package lms_backend_core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String name;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String content;

    @Column(name = "video_url", columnDefinition = "TEXT")
    private String videoUrl;

    @Builder.Default
    @Column(name = "is_free_preview")
    private Boolean isPreview = false;

    @Builder.Default
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 1;

    @Builder.Default
    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", length = 32)
    @Builder.Default
    private LessonType lessonType = LessonType.VIDEO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Chapter chapter;

    @OneToMany(mappedBy = "lesson")
    @OrderBy("id ASC")
    private List<LessonAttachment> attachments;

    public enum LessonType {
        VIDEO,
        ARTICLE,
        DOCUMENT,
        CODE_PRACTICE,
        DOCUMENT_AND_CODING,
        QUIZ
    }
}