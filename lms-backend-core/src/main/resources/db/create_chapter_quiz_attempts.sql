CREATE TABLE IF NOT EXISTS chapter_quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_count INTEGER NOT NULL CHECK (question_count > 0),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    started_at TIMESTAMPTZ NOT NULL,
    deadline_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    auto_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    correct_count INTEGER,
    incorrect_count INTEGER,
    score NUMERIC(5, 2),
    elapsed_seconds INTEGER,
    CONSTRAINT chapter_quiz_attempts_result_state CHECK (
        (submitted_at IS NULL AND correct_count IS NULL AND incorrect_count IS NULL
            AND score IS NULL AND elapsed_seconds IS NULL)
        OR
        (submitted_at IS NOT NULL AND correct_count IS NOT NULL AND incorrect_count IS NOT NULL
            AND score IS NOT NULL AND elapsed_seconds IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_chapter_quiz_attempts_student_chapter
    ON chapter_quiz_attempts (student_id, chapter_id);

CREATE TABLE IF NOT EXISTS chapter_quiz_attempt_questions (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES chapter_quiz_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES question_bank(id),
    position INTEGER NOT NULL CHECK (position > 0),
    selected_option VARCHAR(10),
    is_correct BOOLEAN,
    CONSTRAINT uq_chapter_quiz_attempt_question UNIQUE (attempt_id, question_id),
    CONSTRAINT uq_chapter_quiz_attempt_position UNIQUE (attempt_id, position)
);
