package lms_backend_core.service;

import lms_backend_core.dto.LessonCommentDtos;
import lms_backend_core.entity.Lesson;
import lms_backend_core.entity.LessonComment;
import lms_backend_core.entity.LessonCommentHelpfulVote;
import lms_backend_core.entity.User;
import lms_backend_core.repository.LessonCommentHelpfulVoteRepository;
import lms_backend_core.repository.LessonCommentRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonCommentService {

    private final LessonCommentRepository commentRepository;
    private final LessonCommentHelpfulVoteRepository helpfulVoteRepository;
    private final UserRepository userRepository;
    private final LearningFlowService learningFlowService;

    @Transactional(readOnly = true)
    public List<LessonCommentDtos.Comment> getComments(Long lessonId, Authentication authentication) {
        learningFlowService.getAccessibleLesson(lessonId, authentication);
        List<LessonComment> comments = commentRepository.findAllByLessonIdOrderByCreatedAtAscIdAsc(lessonId);
        if (comments.isEmpty()) return List.of();
        User student = findStudent(authentication);
        Long userId = student == null ? -1L : student.getId();
        Map<Long, LessonCommentHelpfulVoteRepository.HelpfulSummary> summaries =
                helpfulVoteRepository.findHelpfulSummaries(
                                comments.stream().map(LessonComment::getId).toList(),
                                userId)
                        .stream()
                        .collect(Collectors.toMap(
                                LessonCommentHelpfulVoteRepository.HelpfulSummary::getCommentId,
                                Function.identity()));
        return comments.stream()
                .map(comment -> {
                    var summary = summaries.get(comment.getId());
                    return LessonCommentDtos.Comment.from(
                            comment,
                            summary == null ? 0 : summary.getHelpfulCount(),
                            summary != null && Boolean.TRUE.equals(summary.getHelpfulByCurrentUser()));
                })
                .toList();
    }

    @Transactional
    public LessonCommentDtos.Comment createComment(
            Long lessonId,
            LessonCommentDtos.CreateRequest request,
            Authentication authentication) {
        Lesson lesson = learningFlowService.getAccessibleLesson(lessonId, authentication);
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        LessonComment parent = null;
        if (request.parentCommentId() != null) {
            parent = commentRepository.findByIdAndLessonId(request.parentCommentId(), lessonId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found."));
            if (parent.getParent() != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Replies can only be one level deep.");
            }
        }

        LessonComment comment = new LessonComment();
        comment.setLesson(lesson);
        comment.setUser(user);
        comment.setParent(parent);
        comment.setContent(request.content().trim());
        if (comment.getContent().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot be blank.");
        }
        return LessonCommentDtos.Comment.from(commentRepository.save(comment), 0, false);
    }

    @Transactional
    public void markHelpful(Long lessonId, Long commentId, Authentication authentication) {
        User user = learningFlowService.getStudent(authentication);
        learningFlowService.getAccessibleLesson(lessonId, authentication);
        LessonComment comment = commentRepository.findByIdAndLessonId(commentId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found."));
        if (helpfulVoteRepository.findByCommentIdAndUserId(comment.getId(), user.getId()).isPresent()) return;

        LessonCommentHelpfulVote vote = new LessonCommentHelpfulVote();
        vote.setComment(comment);
        vote.setUser(user);
        helpfulVoteRepository.save(vote);
    }

    @Transactional
    public void removeHelpful(Long lessonId, Long commentId, Authentication authentication) {
        User user = learningFlowService.getStudent(authentication);
        learningFlowService.getAccessibleLesson(lessonId, authentication);
        if (!commentRepository.existsByIdAndLessonId(commentId, lessonId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found.");
        }
        helpfulVoteRepository.deleteByCommentIdAndUserId(commentId, user.getId());
    }

    private User findStudent(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
}
