package lms_backend_core.repository;

import lms_backend_core.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChapterQuizQuestionRepository extends JpaRepository<QuestionBank, Long> {

    @Query("""
            select distinct question
            from Quiz quiz join quiz.questions question
            where quiz.lesson.chapter.id = :chapterId
            """)
    List<QuestionBank> findDistinctQuestionsInChapter(@Param("chapterId") Long chapterId);
}
