package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.TeacherContentDtos;
import lms_backend_core.config.UploadResourceConfig;
import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherContentController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final LessonAttachmentRepository attachmentRepository;
    private final ChapterQuizQuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final VideoInteractiveQuestionRepository videoQuestionRepository;
    private final UploadResourceConfig uploadResourceConfig;

    @Value("${app.upload-max-bytes:10485760}")
    private long maximumUploadBytes;

    @GetMapping("/courses/{courseId}/content")
    @Transactional(readOnly = true)
    public List<TeacherContentDtos.ChapterView> getCourseContent(
            @PathVariable Long courseId,
            Authentication authentication) {
        requireOwnedCourse(courseId, authentication);
        return chapterRepository.findByCourseIdOrderByOrderIndexAscIdAsc(courseId).stream()
                .map(chapter -> TeacherContentDtos.ChapterView.from(chapter, chapter.getLessons().stream()
                        .map(lesson -> TeacherContentDtos.LessonView.from(
                                lesson, attachmentRepository.findAllByLessonIdOrderByIdAsc(lesson.getId())))
                        .toList()))
                .toList();
    }

    @PostMapping("/courses/{courseId}/chapters")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherContentDtos.ChapterView createChapter(
            @PathVariable Long courseId,
            @Valid @RequestBody TeacherContentDtos.ChapterInput input,
            Authentication authentication) {
        Course course = requireOwnedCourse(courseId, authentication);
        Chapter chapter = new Chapter();
        chapter.setCourse(course);
        chapter.setTitle(input.title().trim());
        int nextOrderIndex = chapterRepository.findByCourseIdOrderByOrderIndexAscIdAsc(courseId).stream()
                .map(Chapter::getOrderIndex)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0) + 1;
        chapter.setOrderIndex(input.orderIndex() == null ? nextOrderIndex : input.orderIndex());
        return TeacherContentDtos.ChapterView.from(chapterRepository.save(chapter), List.of());
    }

    @PutMapping("/chapters/{chapterId}")
    @Transactional
    public TeacherContentDtos.ChapterView updateChapter(
            @PathVariable Long chapterId,
            @Valid @RequestBody TeacherContentDtos.ChapterInput input,
            Authentication authentication) {
        Chapter chapter = requireOwnedChapter(chapterId, authentication);
        chapter.setTitle(input.title().trim());
        if (input.orderIndex() != null)
            chapter.setOrderIndex(input.orderIndex());
        return TeacherContentDtos.ChapterView.from(chapterRepository.save(chapter), List.of());
    }

    @DeleteMapping("/chapters/{chapterId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteChapter(@PathVariable Long chapterId, Authentication authentication) {
        Chapter chapter = requireOwnedChapter(chapterId, authentication);
        chapterRepository.delete(chapter);
    }

    @PostMapping("/chapters/{chapterId}/lessons")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherContentDtos.LessonView createLesson(
            @PathVariable Long chapterId,
            @Valid @RequestBody TeacherContentDtos.LessonInput input,
            Authentication authentication) {
        Chapter chapter = requireOwnedChapter(chapterId, authentication);
        Lesson lesson = new Lesson();
        lesson.setChapter(chapter);
        int nextOrderIndex = lessonRepository.findByChapterIdOrderByOrderIndexAscIdAsc(chapterId).stream()
                .map(Lesson::getOrderIndex)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0) + 1;
        applyLessonInput(lesson, input);
        if (input.orderIndex() == null)
            lesson.setOrderIndex(nextOrderIndex);
        Lesson saved = lessonRepository.save(lesson);
        if (saved.getLessonType() == Lesson.LessonType.VIDEO && input.interactiveQuestions() != null) {
            saveInteractiveQuestions(saved, input.interactiveQuestions(), currentTeacher(authentication));
        }
        return TeacherContentDtos.LessonView.from(saved, List.of());
    }

    @PutMapping("/lessons/{lessonId}")
    @Transactional
    public TeacherContentDtos.LessonView updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody TeacherContentDtos.LessonInput input,
            Authentication authentication) {
        Lesson lesson = requireOwnedLesson(lessonId, authentication);
        applyLessonInput(lesson, input);
        Lesson saved = lessonRepository.save(lesson);
        if (saved.getLessonType() == Lesson.LessonType.VIDEO && input.interactiveQuestions() != null) {
            saveInteractiveQuestions(saved, input.interactiveQuestions(), currentTeacher(authentication));
        }
        return TeacherContentDtos.LessonView.from(saved, attachmentRepository.findAllByLessonIdOrderByIdAsc(lessonId));
    }

    @DeleteMapping("/lessons/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteLesson(@PathVariable Long lessonId, Authentication authentication) {
        lessonRepository.delete(requireOwnedLesson(lessonId, authentication));
    }

    @GetMapping("/lessons/{lessonId}/quiz")
    @Transactional(readOnly = true)
    public TeacherContentDtos.QuizView getQuiz(
            @PathVariable Long lessonId,
            Authentication authentication) {
        requireOwnedLesson(lessonId, authentication);
        return quizRepository.findByLessonId(lessonId)
                .map(TeacherContentDtos.QuizView::from)
                .orElseGet(() -> new TeacherContentDtos.QuizView(
                        null, "", 15, 80, 10, Quiz.QuestionSelectionMode.RANDOM, List.of()));
    }

    @PostMapping("/lessons/{lessonId}/attachments")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherContentDtos.AttachmentView addAttachment(
            @PathVariable Long lessonId,
            @Valid @RequestBody TeacherContentDtos.AttachmentInput input,
            Authentication authentication) {
        Lesson lesson = requireOwnedLesson(lessonId, authentication);
        LessonAttachment attachment = new LessonAttachment();
        attachment.setLesson(lesson);
        attachment.setFileName(input.fileName().trim());
        attachment.setFileUrl(input.fileUrl().trim());
        attachment.setFileType(parseAttachmentType(input.fileType()));
        attachment.setFileSizeBytes(input.fileSizeBytes() == null ? 0 : input.fileSizeBytes());
        return TeacherContentDtos.AttachmentView.from(attachmentRepository.save(attachment));
    }

    @PostMapping(value = "/lessons/{lessonId}/attachments/upload", consumes = "multipart/form-data")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherContentDtos.AttachmentView uploadAttachment(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") String fileType,
            Authentication authentication) {
        Lesson lesson = requireOwnedLesson(lessonId, authentication);
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a non-empty file.");
        }
        if (file.getSize() > maximumUploadBytes) {
            throw new ResponseStatusException(
                    HttpStatus.CONTENT_TOO_LARGE,
                    "File exceeds the configured upload limit of " + maximumUploadBytes + " bytes.");
        }
        LessonAttachment.FileType parsedType = parseAttachmentType(fileType);
        String originalName = Path.of(file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename())
                .getFileName().toString();
        if (originalName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded file must have a name.");
        }
        String extension = "";
        int extensionIndex = originalName.lastIndexOf('.');
        if (extensionIndex >= 0 && originalName.substring(extensionIndex + 1).matches("[A-Za-z0-9]{1,10}")) {
            extension = originalName.substring(extensionIndex).toLowerCase(Locale.ROOT);
        }
        String storedName = UUID.randomUUID() + extension;
        Path uploadDirectory = uploadResourceConfig.getUploadDirectory();
        Path storedPath = uploadDirectory.resolve(storedName);
        try {
            Files.createDirectories(uploadDirectory);
            try (var input = file.getInputStream()) {
                Files.copy(input, storedPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save uploaded attachment.",
                    exception);
        }

        LessonAttachment attachment = new LessonAttachment();
        attachment.setLesson(lesson);
        attachment.setFileName(originalName);
        attachment.setFileUrl("/uploads/" + storedName);
        attachment.setFileType(parsedType);
        attachment.setFileSizeBytes(file.getSize());
        try {
            return TeacherContentDtos.AttachmentView.from(attachmentRepository.save(attachment));
        } catch (DataAccessException exception) {
            try {
                Files.deleteIfExists(storedPath);
            } catch (IOException cleanupException) {
                exception.addSuppressed(cleanupException);
            }
            throw exception;
        }
    }

    @DeleteMapping("/lessons/{lessonId}/attachments/{attachmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteAttachment(
            @PathVariable Long lessonId,
            @PathVariable Long attachmentId,
            Authentication authentication) {
        requireOwnedLesson(lessonId, authentication);
        LessonAttachment attachment = attachmentRepository.findByIdAndLessonId(attachmentId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found."));
        attachmentRepository.delete(attachment);
    }

    @GetMapping("/question-bank")
    @Transactional(readOnly = true)
    public List<TeacherContentDtos.QuestionView> getQuestions(
            @RequestParam(required = false) Long courseId,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        if (courseId != null)
            requireOwnedCourse(courseId, authentication);
        List<QuestionBank> questions = courseId == null
                ? questionRepository.findAllByTeacherIdOrderByCreatedAtDesc(teacher.getId())
                : questionRepository.findAvailableForCourse(teacher.getId(), courseId);
        return questions.stream().map(TeacherContentDtos.QuestionView::from).toList();
    }

    @PostMapping("/question-bank")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherContentDtos.QuestionView createQuestion(
            @Valid @RequestBody TeacherContentDtos.QuestionInput input,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        if (input.courseId() != null)
            requireOwnedCourse(input.courseId(), authentication);
        validateQuestionChapter(input, authentication);
        QuestionBank question = new QuestionBank();
        question.setTeacherId(teacher.getId());
        question.setCourseId(input.courseId());
        applyQuestionInput(question, input);
        return TeacherContentDtos.QuestionView.from(questionRepository.save(question));
    }

    @PutMapping("/question-bank/{questionId}")
    @Transactional
    public TeacherContentDtos.QuestionView updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody TeacherContentDtos.QuestionInput input,
            Authentication authentication) {
        User teacher = currentTeacher(authentication);
        QuestionBank question = questionRepository.findById(questionId)
                .filter(value -> value.getTeacherId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        if (input.courseId() != null)
            requireOwnedCourse(input.courseId(), authentication);
        validateQuestionChapter(input, authentication);
        question.setCourseId(input.courseId());
        applyQuestionInput(question, input);
        return TeacherContentDtos.QuestionView.from(questionRepository.save(question));
    }

    @DeleteMapping("/question-bank/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteQuestion(@PathVariable Long questionId, Authentication authentication) {
        User teacher = currentTeacher(authentication);
        QuestionBank question = questionRepository.findById(questionId)
                .filter(value -> value.getTeacherId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        try {
            questionRepository.delete(question);
            questionRepository.flush();
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "This question is used by a quiz and cannot be deleted.", exception);
        }
    }

    @PutMapping("/lessons/{lessonId}/quiz")
    @Transactional
    public void saveQuiz(
            @PathVariable Long lessonId,
            @Valid @RequestBody TeacherContentDtos.QuizInput input,
            Authentication authentication) {
        Lesson lesson = requireOwnedLesson(lessonId, authentication);
        List<Long> questionIds = input.questionIds() == null ? List.of() : input.questionIds();
        List<QuestionBank> questions = questionRepository.findAllById(questionIds);
        Long courseId = lesson.getChapter().getCourse().getId();
        User teacher = currentTeacher(authentication);
        if (questions.size() != questionIds.stream().distinct().count()
                || questions.stream().anyMatch(question -> !question.getTeacherId().equals(teacher.getId())
                        || question.getCourseId() != null && !question.getCourseId().equals(courseId))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Quiz questions must belong to this teacher and course.");
        }
        Quiz quiz = quizRepository.findByLessonId(lessonId).orElseGet(Quiz::new);
        int questionCount = input.questionCount() == null ? 10 : input.questionCount();
        Quiz.QuestionSelectionMode selectionMode = input.selectionMode() == null
                ? Quiz.QuestionSelectionMode.RANDOM : input.selectionMode();
        int availableQuestionCount = selectionMode == Quiz.QuestionSelectionMode.MANUAL
                ? questions.size()
                : questionRepository.findAvailableForCourse(teacher.getId(), courseId).size();
        if (questionCount > availableQuestionCount) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Question count exceeds the number of available quiz questions.");
        }
        quiz.setLesson(lesson);
        quiz.setTitle(input.title().trim());
        quiz.setTimeLimitMinutes(input.timeLimitMinutes() == null ? 15 : input.timeLimitMinutes());
        quiz.setQuestionCount(questionCount);
        quiz.setSelectionMode(selectionMode);
        quiz.setPassScore(input.passScore() == null ? 80 : input.passScore());
        quiz.setQuestions(questions);
        quizRepository.save(quiz);
    }

    @GetMapping("/lessons/{lessonId}/interactive-questions")
    @Transactional(readOnly = true)
    public List<TeacherContentDtos.VideoQuestionView> getInteractiveQuestions(
            @PathVariable Long lessonId,
            Authentication authentication) {
        requireOwnedLesson(lessonId, authentication);
        return videoQuestionRepository.findAllByLessonIdOrderByVideoTimestampAscIdAsc(lessonId).stream()
                .map(item -> new TeacherContentDtos.VideoQuestionView(
                        item.getId(),
                        item.getQuestion().getId(),
                        item.getQuestion().getQuestionText(),
                        item.getQuestion().getOptionsJson(),
                        item.getQuestion().getCorrectOption(),
                        item.getVideoTimestamp()))
                .toList();
    }

    @PutMapping("/lessons/{lessonId}/interactive-questions")
    @Transactional
    public List<TeacherContentDtos.VideoQuestionView> saveInteractiveQuestions(
            @PathVariable Long lessonId,
            @Valid @RequestBody List<TeacherContentDtos.VideoQuestionInput> inputs,
            Authentication authentication) {
        if (inputs == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Video questions must be provided as a list.");
        }
        Lesson lesson = requireOwnedLesson(lessonId, authentication);
        return saveInteractiveQuestions(lesson, inputs, currentTeacher(authentication));
    }

    private List<TeacherContentDtos.VideoQuestionView> saveInteractiveQuestions(
            Lesson lesson,
            List<TeacherContentDtos.VideoQuestionInput> inputs,
            User teacher) {
        if (inputs.stream().anyMatch(input -> input == null || input.questionId() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Every video question needs a question ID.");
        }
        List<Long> questionIds = inputs.stream()
                .map(TeacherContentDtos.VideoQuestionInput::questionId)
                .toList();
        if (questionIds.size() != questionIds.stream().distinct().count()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A question can only be added once per video.");
        }
        List<QuestionBank> questions = questionRepository.findAllById(questionIds);
        Long courseId = lesson.getChapter().getCourse().getId();
        if (questions.size() != questionIds.stream().distinct().count()
                || questions.stream().anyMatch(question -> !question.getTeacherId().equals(teacher.getId())
                        || question.getCourseId() != null && !question.getCourseId().equals(courseId))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Questions must belong to this teacher and course.");
        }
        List<VideoInteractiveQuestion> existing = videoQuestionRepository
                .findAllByLessonIdOrderByVideoTimestampAscIdAsc(lesson.getId());
        Map<Long, VideoInteractiveQuestion> existingByQuestionId = existing.stream()
                .collect(Collectors.toMap(
                        item -> item.getQuestion().getId(),
                        item -> item));
        Set<Long> retainedQuestionIds = new HashSet<>(questionIds);
        videoQuestionRepository.deleteAll(existing.stream()
                .filter(item -> !retainedQuestionIds.contains(item.getQuestion().getId()))
                .toList());
        List<VideoInteractiveQuestion> saved = inputs.stream().map(input -> {
            VideoInteractiveQuestion interactiveQuestion = existingByQuestionId.get(input.questionId());
            if (interactiveQuestion == null) {
                interactiveQuestion = new VideoInteractiveQuestion();
                interactiveQuestion.setLesson(lesson);
                interactiveQuestion.setQuestion(questions.stream()
                        .filter(question -> question.getId().equals(input.questionId())).findFirst().orElseThrow());
            }
            interactiveQuestion.setVideoTimestamp(input.videoTimestamp() == null ? 0 : input.videoTimestamp());
            return interactiveQuestion;
        }).toList();
        return videoQuestionRepository.saveAll(saved).stream()
                .sorted(Comparator.comparing(VideoInteractiveQuestion::getVideoTimestamp)
                        .thenComparing(VideoInteractiveQuestion::getId))
                .map(item -> new TeacherContentDtos.VideoQuestionView(item.getId(),
                item.getQuestion().getId(), item.getQuestion().getQuestionText(), item.getQuestion().getOptionsJson(),
                item.getQuestion().getCorrectOption(), item.getVideoTimestamp()))
                .toList();
    }

    private void applyLessonInput(Lesson lesson, TeacherContentDtos.LessonInput input) {
        lesson.setName(input.title().trim());
        lesson.setLessonType(parseLessonType(input.lessonType()));
        lesson.setVideoUrl(input.videoUrl());
        lesson.setContent(input.contentText());
        lesson.setDurationSeconds(input.durationSeconds() == null ? 0 : input.durationSeconds());
        lesson.setOrderIndex(input.orderIndex() == null ? 1 : input.orderIndex());
        lesson.setIsPreview(Boolean.TRUE.equals(input.isFreePreview()));
    }

    private void applyQuestionInput(QuestionBank question, TeacherContentDtos.QuestionInput input) {
        String questionType = parseQuestionType(input.questionType());
        boolean hasCorrectOption = input.optionsJson().isArray()
                && input.optionsJson().size() >= 2
                && input.optionsJson().findValuesAsText("id").contains(input.correctOption().trim());
        if ("MULTIPLE_CHOICE".equals(questionType) && !hasCorrectOption) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "optionsJson must contain an option whose id matches correctOption.");
        }
        if (!input.optionsJson().isArray()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "optionsJson must be an array.");
        }
        question.setQuestionText(input.questionText().trim());
        question.setOptionsJson(input.optionsJson());
        question.setCorrectOption("MULTIPLE_CHOICE".equals(questionType) ? input.correctOption().trim() : "A");
        question.setExplanation(input.explanation());
        question.setQuestionType(questionType);
        question.setDifficulty(parseQuestionDifficulty(input.difficulty()));
        question.setHint(input.hint());
        question.setChapterId(input.chapterId());
    }

    private void validateQuestionChapter(TeacherContentDtos.QuestionInput input, Authentication authentication) {
        if (input.chapterId() == null) return;
        Chapter chapter = requireOwnedChapter(input.chapterId(), authentication);
        if (input.courseId() != null && !chapter.getCourse().getId().equals(input.courseId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chapter does not belong to the selected course.");
        }
    }

    private String parseQuestionType(String value) {
        String type = value == null || value.isBlank() ? "MULTIPLE_CHOICE" : value.toUpperCase(Locale.ROOT);
        if (!List.of("MULTIPLE_CHOICE", "ESSAY", "CODE").contains(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid question type.");
        }
        return type;
    }

    private String parseQuestionDifficulty(String value) {
        String difficulty = value == null || value.isBlank() ? "EASY" : value.toUpperCase(Locale.ROOT);
        if (!List.of("EASY", "MEDIUM", "HARD").contains(difficulty)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid question difficulty.");
        }
        return difficulty;
    }

    private Lesson.LessonType parseLessonType(String value) {
        try {
            return Lesson.LessonType.valueOf(value == null ? "VIDEO" : value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid lesson type.", exception);
        }
    }

    private LessonAttachment.FileType parseAttachmentType(String value) {
        try {
            return LessonAttachment.FileType.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid attachment file type.", exception);
        }
    }

    private Course requireOwnedCourse(Long courseId, Authentication authentication) {
        User teacher = currentTeacher(authentication);
        return courseRepository.findById(courseId)
                .filter(course -> course.getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
    }

    private Chapter requireOwnedChapter(Long chapterId, Authentication authentication) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found."));
        if (!chapter.getCourse().getTeacher().getEmail().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found.");
        }
        return chapter;
    }

    private Lesson requireOwnedLesson(Long lessonId, Authentication authentication) {
        User teacher = currentTeacher(authentication);
        return lessonRepository.findById(lessonId)
                .filter(lesson -> lesson.getChapter().getCourse().getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found."));
    }

    private User currentTeacher(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }
}
