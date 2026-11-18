ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS target_role VARCHAR(20);

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT PRIMARY KEY CHECK (id = 1),
    site_name VARCHAR(255) NOT NULL DEFAULT 'EduFlow LMS',
    support_email VARCHAR(255) NOT NULL DEFAULT 'support@eduflow.vn',
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    allow_registration BOOLEAN NOT NULL DEFAULT TRUE,
    auto_approve_courses BOOLEAN NOT NULL DEFAULT FALSE,
    auto_approve_teachers BOOLEAN NOT NULL DEFAULT FALSE,
    platform_commission INTEGER NOT NULL DEFAULT 15 CHECK (platform_commission BETWEEN 0 AND 100),
    min_course_price BIGINT NOT NULL DEFAULT 50000 CHECK (min_course_price >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(20) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target TEXT NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at DESC);
