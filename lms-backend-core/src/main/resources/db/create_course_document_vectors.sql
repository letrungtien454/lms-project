-- Run once against the application's PostgreSQL database before starting the backend.
-- The database user must be allowed to install the pgvector extension.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS course_document_vectors (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    lesson_id BIGINT,
    content_chunk TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE course_document_vectors
    ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE course_document_vectors
    ADD COLUMN IF NOT EXISTS source_attachment_id BIGINT;

ALTER TABLE course_document_vectors
    ADD COLUMN IF NOT EXISTS source_checksum VARCHAR(64);

ALTER TABLE course_document_vectors
    ADD COLUMN IF NOT EXISTS chunk_index INTEGER;

CREATE INDEX IF NOT EXISTS idx_course_document_vectors_lesson
    ON course_document_vectors (course_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_course_document_vectors_attachment
    ON course_document_vectors (source_attachment_id, source_checksum);
