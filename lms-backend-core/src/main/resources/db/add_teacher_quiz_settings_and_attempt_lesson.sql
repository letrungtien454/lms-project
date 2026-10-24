ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS selection_mode VARCHAR(16) NOT NULL DEFAULT 'RANDOM';

UPDATE quizzes quiz
SET selection_mode = 'MANUAL',
    question_count = (
        SELECT COUNT(*)::INTEGER
        FROM quiz_questions quiz_question
        WHERE quiz_question.quiz_id = quiz.id
    )
WHERE EXISTS (
    SELECT 1
    FROM quiz_questions quiz_question
    WHERE quiz_question.quiz_id = quiz.id
);

ALTER TABLE chapter_quiz_attempts
    ADD COLUMN IF NOT EXISTS quiz_lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL;

WITH single_quiz_lessons AS (
    SELECT chapter_id, MIN(id) AS lesson_id
    FROM lessons
    WHERE lesson_type = 'QUIZ'
    GROUP BY chapter_id
    HAVING COUNT(*) = 1
)
UPDATE chapter_quiz_attempts attempt
SET quiz_lesson_id = single_quiz_lessons.lesson_id
FROM single_quiz_lessons
WHERE attempt.chapter_id = single_quiz_lessons.chapter_id
  AND attempt.quiz_lesson_id IS NULL
  AND attempt.submitted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chapter_quiz_attempts_student_chapter_lesson
    ON chapter_quiz_attempts (student_id, chapter_id, quiz_lesson_id);
