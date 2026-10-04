ALTER TABLE lessons
    ALTER COLUMN lesson_type TYPE VARCHAR(32);

ALTER TABLE lessons
    DROP CONSTRAINT IF EXISTS lessons_lesson_type_check;

ALTER TABLE lessons
    ADD CONSTRAINT lessons_lesson_type_check
    CHECK (lesson_type IN (
        'VIDEO',
        'ARTICLE',
        'DOCUMENT',
        'CODE_PRACTICE',
        'DOCUMENT_AND_CODING',
        'QUIZ'
    ));
