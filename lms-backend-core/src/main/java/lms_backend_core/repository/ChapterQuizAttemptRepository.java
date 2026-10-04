package lms_backend_core.repository;

import lms_backend_core.entity.ChapterQuizAttempt;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChapterQuizAttemptRepository extends JpaRepository<ChapterQuizAttempt, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select a from ChapterQuizAttempt a
            where a.id = :attemptId and a.student.id = :studentId and a.chapter.id = :chapterId
            """)
    Optional<ChapterQuizAttempt> findForUpdate(
            @Param("attemptId") Long attemptId,
            @Param("studentId") Long studentId,
            @Param("chapterId") Long chapterId);

    @Query("""
            select a from ChapterQuizAttempt a
            where a.id = :attemptId and a.student.id = :studentId and a.chapter.id = :chapterId
            """)
    Optional<ChapterQuizAttempt> findOwnedAttempt(
            @Param("attemptId") Long attemptId,
            @Param("studentId") Long studentId,
            @Param("chapterId") Long chapterId);
}
