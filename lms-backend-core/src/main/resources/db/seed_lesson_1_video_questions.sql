WITH question_data (question_text, options_json, correct_option, explanation, video_timestamp) AS (
    VALUES
        (
            'Sau khi hoàn thành khóa học, học viên sẽ thực hành xây dựng giao diện thực tế của loại website nào?',
            '[
                {"id":"A","text":"Website tin tức"},
                {"id":"B","text":"Website bán hàng"},
                {"id":"C","text":"Website xem phim"},
                {"id":"D","text":"Website cá nhân (Portfolio)"}
            ]'::jsonb,
            'B',
            'Khóa học hướng dẫn phân tích và xây dựng một giao diện website bán hàng thực tế từ con số 0.',
            30
        ),
        (
            'Quy chuẩn đặt tên class được giảng dạy trong khóa học để giúp code sạch và dễ quản lý là gì?',
            '[
                {"id":"A","text":"CAMEL"},
                {"id":"B","text":"PASCAL"},
                {"id":"C","text":"BEM (Block Element Modifier)"},
                {"id":"D","text":"KEBAB"}
            ]'::jsonb,
            'C',
            'BEM là quy chuẩn đặt tên class được dùng để mã nguồn rõ ràng, sạch và dễ quản lý.',
            73
        ),
        (
            'Kỹ thuật nào được sử dụng chính trong khóa học để chia bố cục (layout) giao diện hiện đại?',
            '[
                {"id":"A","text":"CSS Grid"},
                {"id":"B","text":"Float & Clear"},
                {"id":"C","text":"Flexbox"},
                {"id":"D","text":"Table Layout"}
            ]'::jsonb,
            'C',
            'Khóa học tập trung vào Flexbox để chia bố cục giao diện hiện đại.',
            87
        ),
        (
            'Tính năng Responsive trong khóa học nhằm mục đích gì?',
            '[
                {"id":"A","text":"Giúp trang web chạy nhanh hơn"},
                {"id":"B","text":"Thích ứng giao diện tốt trên nhiều loại thiết bị (PC, tablet, mobile)"},
                {"id":"C","text":"Tự động dịch ngôn ngữ website"},
                {"id":"D","text":"Tăng tính bảo mật cho website"}
            ]'::jsonb,
            'B',
            'Responsive giúp giao diện hiển thị phù hợp trên PC, tablet và điện thoại.',
            112
        )
),
lesson_owner AS (
    SELECT l.id AS lesson_id, c.id AS course_id, c.teacher_id
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE l.id = 1 AND c.id = 1
),
inserted_questions AS (
    INSERT INTO question_bank
        (teacher_id, course_id, question_text, options_json, correct_option, explanation)
    SELECT owner.teacher_id,
           owner.course_id,
           question.question_text,
           question.options_json,
           question.correct_option,
           question.explanation
    FROM question_data question
    CROSS JOIN lesson_owner owner
    WHERE NOT EXISTS (
        SELECT 1
        FROM question_bank existing
        WHERE existing.course_id = owner.course_id
          AND existing.question_text = question.question_text
    )
    RETURNING id, question_text
),
question_ids AS (
    SELECT inserted.id, question.video_timestamp
    FROM inserted_questions inserted
    JOIN question_data question USING (question_text)

    UNION ALL

    SELECT existing.id, question.video_timestamp
    FROM question_data question
    JOIN question_bank existing
      ON existing.course_id = 1
     AND existing.question_text = question.question_text
    WHERE NOT EXISTS (
        SELECT 1 FROM inserted_questions inserted WHERE inserted.id = existing.id
    )
),
lesson_questions AS (
    SELECT owner.lesson_id, question_ids.id AS question_id, question_ids.video_timestamp
    FROM lesson_owner owner
    CROSS JOIN question_ids
)
INSERT INTO video_interactive_questions (lesson_id, question_id, video_timestamp)
SELECT lesson_id, question_id, video_timestamp
FROM lesson_questions
ON CONFLICT (lesson_id, question_id)
DO UPDATE SET video_timestamp = EXCLUDED.video_timestamp
RETURNING lesson_id, question_id, video_timestamp;
