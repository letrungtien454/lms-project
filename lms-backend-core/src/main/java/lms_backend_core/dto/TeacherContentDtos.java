package lms_backend_core.dto;

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
import java.util.List;

public final class TeacherContentDtos {

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
            @NotNull JsonNode optionsJson,
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

    public record QuestionView(Long id, String questionText, JsonNode optionsJson, String correctOption,
                               String explanation, Long courseId, Long chapterId, String questionType,
                               String difficulty, String hint, OffsetDateTime createdAt) {
        public static QuestionView from(QuestionBank question) {
            return new QuestionView(question.getId(), question.getQuestionText(), question.getOptionsJson(),
                    question.getCorrectOption(), question.getExplanation(), question.getCourseId(),
                    question.getChapterId(), question.getQuestionType(), question.getDifficulty(),
                    question.getHint(), question.getCreatedAt());
        }
    }

    public record VideoQuestionView(Long id, Long questionId, String questionText, JsonNode optionsJson,
                                    String correctOption, Integer videoTimestamp) {
    }
}
