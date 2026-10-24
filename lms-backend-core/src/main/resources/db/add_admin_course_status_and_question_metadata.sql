ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS status VARCHAR(20);

UPDATE courses
SET status = CASE WHEN is_published THEN 'PUBLISHED' ELSE 'PENDING' END
WHERE status IS NULL;

ALTER TABLE courses
    ALTER COLUMN status SET DEFAULT 'PENDING',
    ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'courses_status_check'
          AND conrelid = 'courses'::regclass
    ) THEN
        ALTER TABLE courses
            ADD CONSTRAINT courses_status_check
            CHECK (status IN ('PENDING', 'PUBLISHED', 'PAUSED'));
    END IF;
END $$;

ALTER TABLE question_bank
    ADD COLUMN IF NOT EXISTS chapter_id BIGINT,
    ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) NOT NULL DEFAULT 'EASY',
    ADD COLUMN IF NOT EXISTS hint TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'question_bank_chapter_id_fkey'
          AND conrelid = 'question_bank'::regclass
    ) THEN
        ALTER TABLE question_bank
            ADD CONSTRAINT question_bank_chapter_id_fkey
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;
    END IF;
END $$;
