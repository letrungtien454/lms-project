CREATE TABLE IF NOT EXISTS video_interactive_questions (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    video_timestamp INTEGER NOT NULL CHECK (video_timestamp >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_video_interactive_lesson_question UNIQUE (lesson_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_video_interactive_questions_lesson_timestamp
    ON video_interactive_questions (lesson_id, video_timestamp);

CREATE TABLE IF NOT EXISTS video_interactive_question_attempts (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_interactive_question_id BIGINT NOT NULL
        REFERENCES video_interactive_questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_video_question_attempt_student
        UNIQUE (student_id, video_interactive_question_id)
);
