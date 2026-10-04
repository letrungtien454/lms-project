ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS level VARCHAR(20);

UPDATE courses
SET level = 'ALL_LEVELS'
WHERE level IS NULL;

ALTER TABLE courses
    ALTER COLUMN level SET DEFAULT 'ALL_LEVELS',
    ALTER COLUMN level SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'courses_level_check'
          AND conrelid = 'courses'::regclass
    ) THEN
        ALTER TABLE courses
            ADD CONSTRAINT courses_level_check
            CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'));
    END IF;
END $$;
