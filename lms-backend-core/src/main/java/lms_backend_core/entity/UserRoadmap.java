package lms_backend_core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_roadmaps", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "roadmap_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class UserRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(name = "enrolled_at")
    private OffsetDateTime enrolledAt;

    @PrePersist
    protected void onEnroll() {
        enrolledAt = OffsetDateTime.now();
    }
}
