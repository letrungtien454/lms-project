package lms_backend_core.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lms_backend_core.entity.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class TeacherContentDtos {

    private static final ObjectMapper JSON_MAPPER = new ObjectMapper();

    private TeacherContentDtos() {
    }

    public record ChapterInput(@NotBlank String title, @PositiveOrZero Integer orderIndex) {
    }

    public record LessonInput(
            @NotBlank String title,
            String lessonType,
            String videoUrl,
            String contentText,
            @PositiveOrZero Integer durationSeconds,
            @PositiveOrZero Integer orderIndex,
            Boolean isFreePreview,
            @Valid List<VideoQuestionInput> interactiveQuestions) {
    }

    public record AttachmentInput(
            @NotBlank String fileName,
            @NotBlank String fileUrl,
            @NotBlank String fileType,
            @PositiveOrZero Long fileSizeBytes) {
    }

    public record QuizInput(
            @NotBlank String title,
            @Min(1) @Max(120) Integer timeLimitMinutes,
            @Min(1) @Max(100) Integer passScore,
            @Min(1) @Max(500) Integer questionCount,
            Quiz.QuestionSelectionMode selectionMode,
            List<Long> questionIds) {
    }

    public record QuizView(
            Long id,
            String title,
            Integer timeLimitMinutes,
            Integer passScore,
            Integer questionCount,
            Quiz.QuestionSelectionMode selectionMode,
            List<Long> questionIds) {
        public static QuizView from(Quiz quiz) {
            return new QuizView(
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getTimeLimitMinutes(),
                    quiz.getPassScore(),
                    quiz.getQuestionCount(),
                    quiz.getSelectionMode(),
                    quiz.getQuestions() == null ? List.of()
                            : quiz.getQuestions().stream().map(QuestionBank::getId).toList());
        }
    }

    public record VideoQuestionInput(@NotNull Long questionId, @PositiveOrZero Integer videoTimestamp) {
    }

    public record QuestionInput(
            @NotBlank String questionText,
            @NotNull Object optionsJson,
            @NotBlank @Size(max = 10) String correctOption,
            String explanation,
            Long courseId,
            Long chapterId,
            String questionType,
            String difficulty,
            String hint) {
    }

    public record AttachmentView(Long id, String fileName, String fileUrl, String fileType, Long fileSizeBytes) {
        public static AttachmentView from(LessonAttachment attachment) {
            return new AttachmentView(attachment.getId(), attachment.getFileName(), attachment.getFileUrl(),
                    attachment.getFileType().name(), attachment.getFileSizeBytes());
        }
    }

    public record LessonView(Long id, Long chapterId, String title, String lessonType, String videoUrl, String contentText,
                             Integer durationSeconds, Integer orderIndex, Boolean isFreePreview,
                             List<AttachmentView> attachments) {
        public static LessonView from(Lesson lesson, List<LessonAttachment> attachments) {
            return new LessonView(lesson.getId(), lesson.getChapter().getId(), lesson.getName(), lesson.getLessonType().name(),
                    lesson.getVideoUrl(), lesson.getContent(), lesson.getDurationSeconds(), lesson.getOrderIndex(),
                    lesson.getIsPreview(), attachments.stream().map(AttachmentView::from).toList());
        }
    }

    public record ChapterView(Long id, Long courseId, String title, Integer orderIndex, List<LessonView> lessons) {
        public static ChapterView from(Chapter chapter, List<LessonView> lessons) {
            return new ChapterView(chapter.getId(), chapter.getCourse().getId(), chapter.getTitle(),
                    chapter.getOrderIndex(), lessons);
        }
    }

    public record QuestionView(Long id, String questionText, Object optionsJson, String correctOption,
                               String explanation, Long courseId, Long chapterId, String questionType,
                               String difficulty, String hint, OffsetDateTime createdAt) {
        public static QuestionView from(QuestionBank question) {
            return new QuestionView(question.getId(), question.getQuestionText(), toJsonValue(question.getOptionsJson()),
                    question.getCorrectOption(), question.getExplanation(), question.getCourseId(),
                    question.getChapterId(), question.getQuestionType(), question.getDifficulty(),
                    question.getHint(), question.getCreatedAt());
        }
    }

    public record VideoQuestionView(Long id, Long questionId, String questionText, Object optionsJson,
                                    String correctOption, Integer videoTimestamp) {
        public static VideoQuestionView from(Long id, Long questionId, String questionText, JsonNode optionsJson,
                                             String correctOption, Integer videoTimestamp) {
            return new VideoQuestionView(id, questionId, questionText, toJsonValue(optionsJson),
                    correctOption, videoTimestamp);
        }
    }

    private static Object toJsonValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            Map<String, Object> values = new LinkedHashMap<>();
            node.fields().forEachRemaining(entry -> values.put(entry.getKey(), toJsonValue(entry.getValue())));
            return values;
        }
        if (node.isArray()) {
            List<Object> values = new ArrayList<>(node.size());
            node.forEach(value -> values.add(toJsonValue(value)));
            return values;
        }
        if (node.isTextual()) {
            return node.textValue();
        }
        if (node.isBoolean()) {
            return node.booleanValue();
        }
        if (node.isNumber()) {
            return node.numberValue();
        }
        return node.asText();
    }

    public static JsonNode toJsonNode(Object value) {
        return JSON_MAPPER.valueToTree(value);
    }
}
