package lms_backend_core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lms_backend_core.dto.ChapterQuizDtos;
import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChapterQuizServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final ChapterRepository chapterRepository = mock(ChapterRepository.class);
    private final EnrollmentRepository enrollmentRepository = mock(EnrollmentRepository.class);
    private final ChapterQuizQuestionRepository questionRepository = mock(ChapterQuizQuestionRepository.class);
    private final ChapterQuizAttemptRepository attemptRepository = mock(ChapterQuizAttemptRepository.class);
    private final QuizRepository quizRepository = mock(QuizRepository.class);
    private final ChapterQuizService service = new ChapterQuizService(
            userRepository, chapterRepository, enrollmentRepository, questionRepository, attemptRepository, quizRepository);
    private final Authentication authentication =
            new UsernamePasswordAuthenticationToken("student@example.test", "password", List.of());
    private final User student = new User();

    @BeforeEach
    void setUp() {
        student.setId(7L);
        student.setEmail("student@example.test");
        student.setRole(Role.STUDENT);
        Course course = new Course();
        course.setId(11L);
        User teacher = new User();
        teacher.setId(12L);
        course.setTeacher(teacher);
        Chapter chapter = new Chapter();
        chapter.setId(3L);
        chapter.setCourse(course);
        when(userRepository.findByEmail("student@example.test")).thenReturn(Optional.of(student));
        when(chapterRepository.findById(3L)).thenReturn(Optional.of(chapter));
        when(enrollmentRepository.existsByStudentIdAndCourseId(7L, 11L)).thenReturn(true);
    }

    @Test
    void rejectsRequestLargerThanUniqueChapterQuestionPool() {
        Quiz quiz = quiz(2, 15, Quiz.QuestionSelectionMode.MANUAL, List.of(question(1L, "A")));
        when(quizRepository.findByLessonId(19L)).thenReturn(Optional.of(quiz));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.start(3L, new ChapterQuizDtos.StartRequest(19L), authentication));

        assertEquals(400, exception.getStatusCode().value());
        verify(attemptRepository, never()).save(any());
    }

    @Test
    void availabilityReturnsUniqueChapterQuestionCount() {
        Quiz quiz = quiz(2, 25, Quiz.QuestionSelectionMode.MANUAL,
                List.of(question(1L, "A"), question(2L, "B")));
        when(quizRepository.findByLessonId(19L)).thenReturn(Optional.of(quiz));

        ChapterQuizDtos.Availability availability = service.availability(3L, 19L, authentication);

        assertEquals(3L, availability.chapterId());
        assertEquals(2, availability.availableQuestionCount());
        assertEquals(2, availability.questionCount());
        assertEquals(25, availability.timeLimitMinutes());
    }

    @Test
    void startUsesTeacherConfiguredCountAndTimeInsteadOfClientValues() {
        Quiz quiz = quiz(2, 25, Quiz.QuestionSelectionMode.MANUAL,
                List.of(question(1L, "A"), question(2L, "B"), question(3L, "A")));
        when(quizRepository.findByLessonId(19L)).thenReturn(Optional.of(quiz));
        when(chapterRepository.getReferenceById(3L)).thenReturn(quiz.getLesson().getChapter());
        when(attemptRepository.save(any(ChapterQuizAttempt.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ChapterQuizDtos.StartedAttempt started = service.start(
                3L, new ChapterQuizDtos.StartRequest(19L), authentication);

        assertEquals(2, started.questionCount());
        assertEquals(25, started.timeLimitMinutes());
        assertEquals(2, started.questions().size());
    }

    @Test
    void activeAttemptReturnsCurrentUnsubmittedAttempt() {
        ChapterQuizAttempt attempt = attempt(44L, 3L, 7L);
        attempt.setQuestions(List.of(attemptQuestion(attempt, question(10L, "A"), "B", 1)));
        Quiz quiz = quiz(1, 15, Quiz.QuestionSelectionMode.MANUAL, List.of(question(10L, "A")));
        when(quizRepository.findByLessonId(19L)).thenReturn(Optional.of(quiz));
        when(attemptRepository
                .findFirstByChapter_IdAndQuizLesson_IdAndStudent_IdAndSubmittedAtIsNullOrderByStartedAtDesc(
                        3L, 19L, 7L))
                .thenReturn(Optional.of(attempt));

        ChapterQuizDtos.AttemptStatus status = service.activeAttempt(3L, 19L, authentication);

        assertNotNull(status);
        assertEquals(44L, status.attemptId());
        assertFalse(status.submitted());
        assertEquals(1, status.questions().size());
        assertEquals("B", status.savedAnswers().get(0).selectedOption());
    }

    @Test
    void activeAttemptReturnsNullWhenNoAttemptIsInProgress() {
        when(quizRepository.findByLessonId(19L)).thenReturn(Optional.of(
                quiz(1, 15, Quiz.QuestionSelectionMode.MANUAL, List.of(question(10L, "A")))));
        when(attemptRepository
                .findFirstByChapter_IdAndQuizLesson_IdAndStudent_IdAndSubmittedAtIsNullOrderByStartedAtDesc(
                        3L, 19L, 7L))
                .thenReturn(Optional.empty());

        assertNull(service.activeAttempt(3L, 19L, authentication));
    }

    @Test
    void submitsOnceAndReturnsScoreAndAnswerReview() {
        ChapterQuizAttempt attempt = attempt(1L, 3L, 7L);
        ChapterQuizAttemptQuestion correct = attemptQuestion(attempt, question(10L, "A"), "A", 1);
        ChapterQuizAttemptQuestion incorrect = attemptQuestion(attempt, question(20L, "B"), "A", 2);
        attempt.setQuestions(List.of(correct, incorrect));
        when(attemptRepository.findForUpdate(44L, 7L, 3L)).thenReturn(Optional.of(attempt));

        ChapterQuizDtos.Result result = service.submit(3L, 44L,
                new ChapterQuizDtos.SubmitRequest(java.util.Map.of(10L, "A", 20L, "A")), authentication);

        assertEquals(2, result.totalQuestions());
        assertEquals(1, result.correctCount());
        assertEquals(1, result.incorrectCount());
        assertEquals(50.00, result.score().doubleValue());
        assertEquals("A", result.answers().get(0).correctOption());
        assertTrue(result.answers().get(0).correct());
        assertFalse(result.answers().get(1).correct());
        assertFalse(result.autoSubmitted());

        ResponseStatusException secondSubmission = assertThrows(ResponseStatusException.class,
                () -> service.submit(3L, 44L,
                        new ChapterQuizDtos.SubmitRequest(java.util.Map.of()), authentication));
        assertEquals(409, secondSubmission.getStatusCode().value());
    }

    @Test
    void readingExpiredAttemptAutoSubmitsSavedAnswers() {
        ChapterQuizAttempt attempt = attempt(1L, 3L, 7L);
        attempt.setDeadlineAt(OffsetDateTime.now().minusSeconds(1));
        ChapterQuizAttemptQuestion savedAnswer = attemptQuestion(attempt, question(10L, "A"), "A", 1);
        ChapterQuizAttemptQuestion blankAnswer = attemptQuestion(attempt, question(20L, "B"), null, 2);
        attempt.setQuestions(List.of(savedAnswer, blankAnswer));
        when(attemptRepository.findForUpdate(44L, 7L, 3L)).thenReturn(Optional.of(attempt));

        ChapterQuizDtos.AttemptStatus status = service.getAttempt(3L, 44L, authentication);

        assertTrue(status.submitted());
        assertTrue(status.questions().isEmpty());
        assertTrue(status.result().autoSubmitted());
        assertEquals(1, status.result().correctCount());
        assertEquals(1, status.result().incorrectCount());
    }

    private ChapterQuizAttempt attempt(Long id, Long chapterId, Long studentId) {
        Chapter chapter = new Chapter();
        chapter.setId(chapterId);
        User user = new User();
        user.setId(studentId);
        OffsetDateTime started = OffsetDateTime.now().minusSeconds(10);
        ChapterQuizAttempt attempt = new ChapterQuizAttempt();
        attempt.setId(id);
        attempt.setChapter(chapter);
        attempt.setStudent(user);
        attempt.setQuestionCount(2);
        attempt.setDurationSeconds(60);
        attempt.setStartedAt(started);
        attempt.setDeadlineAt(started.plusSeconds(60));
        return attempt;
    }

    private Quiz quiz(
            int questionCount,
            int timeLimitMinutes,
            Quiz.QuestionSelectionMode selectionMode,
            List<QuestionBank> questions) {
        Course course = new Course();
        course.setId(11L);
        User teacher = new User();
        teacher.setId(12L);
        course.setTeacher(teacher);
        Chapter chapter = new Chapter();
        chapter.setId(3L);
        chapter.setCourse(course);
        Lesson lesson = new Lesson();
        lesson.setId(19L);
        lesson.setChapter(chapter);
        lesson.setLessonType(Lesson.LessonType.QUIZ);
        Quiz quiz = new Quiz();
        quiz.setLesson(lesson);
        quiz.setQuestionCount(questionCount);
        quiz.setTimeLimitMinutes(timeLimitMinutes);
        quiz.setSelectionMode(selectionMode);
        quiz.setQuestions(questions);
        return quiz;
    }

    private ChapterQuizAttemptQuestion attemptQuestion(
            ChapterQuizAttempt attempt, QuestionBank question, String answer, int position) {
        ChapterQuizAttemptQuestion item = new ChapterQuizAttemptQuestion();
        item.setAttempt(attempt);
        item.setQuestion(question);
        item.setSelectedOption(answer);
        item.setPosition(position);
        return item;
    }

    private QuestionBank question(Long id, String correctOption) {
        QuestionBank question = new QuestionBank();
        question.setId(id);
        question.setQuestionText("Question " + id);
        question.setCorrectOption(correctOption);
        question.setExplanation("Explanation");
        try {
            question.setOptionsJson(new ObjectMapper().readTree("""
                    [{"id":"A","text":"Choice A"},{"id":"B","text":"Choice B"}]
                    """));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return question;
    }
}
