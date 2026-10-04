BEGIN;

WITH first_chapter AS (
    SELECT id
    FROM chapters
    WHERE course_id = 1
    ORDER BY order_index, id
    LIMIT 1
)
INSERT INTO lessons (
    chapter_id, title, content_text, video_url, is_free_preview,
    order_index, duration_seconds, lesson_type
)
SELECT first_chapter.id,
       'Tài liệu và thực hành HTML/CSS',
       'Mục tiêu: vận dụng cấu trúc HTML và quy tắc CSS để xây dựng một giao diện nhỏ.' || E'\n\n'
       || '1. Tạo nội dung bằng các thẻ HTML có ý nghĩa như header, main, section và footer.' || E'\n'
       || '2. Dùng class để đặt kiểu trình bày bằng CSS; ưu tiên tên class rõ ràng, nhất quán.' || E'\n'
       || '3. Thực hành dựng một thẻ giới thiệu sản phẩm gồm tiêu đề, mô tả và nút thao tác.' || E'\n'
       || '4. Kiểm tra giao diện ở chiều rộng màn hình khác nhau và điều chỉnh bằng media query.',
       NULL, FALSE, 4, 0, 'DOCUMENT_AND_CODING'
FROM first_chapter
WHERE NOT EXISTS (
    SELECT 1
    FROM lessons existing
    WHERE existing.chapter_id = first_chapter.id
      AND existing.title = 'Tài liệu và thực hành HTML/CSS'
);

UPDATE lessons
SET lesson_type = 'DOCUMENT_AND_CODING'
WHERE title = 'Tài liệu và thực hành HTML/CSS'
  AND order_index = 4
  AND chapter_id IN (
      SELECT id FROM chapters WHERE course_id = 1
  );

UPDATE lessons
SET content_text = content_text
    || E'\n\nMẫu HTML:\n```html\n<article class="card">\n  <h2>Sản phẩm</h2>\n  <p>Mô tả ngắn về sản phẩm.</p>\n  <button>Xem chi tiết</button>\n</article>\n```\n\nMẫu CSS:\n```css\n.card {\n  padding: 1rem;\n  border-radius: 12px;\n  background: #f8fafc;\n}\n```'
WHERE title = 'Tài liệu và thực hành HTML/CSS'
  AND order_index = 4
  AND chapter_id IN (
      SELECT id FROM chapters WHERE course_id = 1
  )
  AND position('```' IN content_text) = 0;

WITH first_chapter AS (
    SELECT id
    FROM chapters
    WHERE course_id = 1
    ORDER BY order_index, id
    LIMIT 1
)
INSERT INTO lessons (
    chapter_id, title, content_text, video_url, is_free_preview,
    order_index, duration_seconds, lesson_type
)
SELECT first_chapter.id,
       'Tổng kết chương 1',
       'Bài kiểm tra tổng kết chương 1. Chọn số câu hỏi và thời gian trước khi bắt đầu.',
       NULL, FALSE, 5, 0, 'QUIZ'
FROM first_chapter
WHERE NOT EXISTS (
    SELECT 1
    FROM lessons existing
    WHERE existing.chapter_id = first_chapter.id
      AND existing.title = 'Tổng kết chương 1'
);

INSERT INTO quizzes (lesson_id, title, time_limit_minutes, pass_score)
SELECT lesson.id, 'Câu hỏi ôn tập: Tổng quan HTML và CSS', 15, 80
FROM lessons lesson
JOIN chapters chapter ON chapter.id = lesson.chapter_id
WHERE chapter.course_id = 1
  AND chapter.id = (
      SELECT id
      FROM chapters
      WHERE course_id = 1
      ORDER BY order_index, id
      LIMIT 1
  )
  AND lesson.order_index = 1
  AND NOT EXISTS (SELECT 1 FROM quizzes existing WHERE existing.lesson_id = lesson.id);

INSERT INTO quiz_questions (quiz_id, question_id)
SELECT quiz.id, interactive.question_id
FROM quizzes quiz
JOIN lessons lesson ON lesson.id = quiz.lesson_id
JOIN video_interactive_questions interactive ON interactive.lesson_id = lesson.id
WHERE lesson.order_index = 1
  AND lesson.chapter_id = (
      SELECT id
      FROM chapters
      WHERE course_id = 1
      ORDER BY order_index, id
      LIMIT 1
  )
  AND NOT EXISTS (
      SELECT 1
      FROM quiz_questions existing
      WHERE existing.quiz_id = quiz.id
        AND existing.question_id = interactive.question_id
  );

COMMIT;
