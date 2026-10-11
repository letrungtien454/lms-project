package lms_backend_core.controller;

import lms_backend_core.dto.review.ReviewReplyRequest;
import lms_backend_core.dto.review.ReviewRequest;
import lms_backend_core.dto.review.ReviewResponse;
import lms_backend_core.entity.Course;
import lms_backend_core.entity.Review;
import lms_backend_core.entity.ReviewHelpful;
import lms_backend_core.entity.ReviewReply;
import lms_backend_core.entity.ReviewReplyHelpful;
import lms_backend_core.entity.User;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.ReviewHelpfulRepository;
import lms_backend_core.repository.ReviewReplyHelpfulRepository;
import lms_backend_core.repository.ReviewReplyRepository;
import lms_backend_core.repository.ReviewRepository;
import lms_backend_core.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository helpfulRepository;
    private final ReviewReplyRepository replyRepository;
    private final ReviewReplyHelpfulRepository replyHelpfulRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping("/api/courses/{courseId}/reviews")
    @Transactional(readOnly = true)
    public ResponseEntity<ReviewResponse.ReviewListResponse> getReviews(
            @PathVariable Long courseId,
            Authentication authentication) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));

        User currentUser = getOptionalUser(authentication);

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 1; star <= 5; star++) {
            distribution.put(star, 0L);
        }

        for (Object[] row : reviewRepository.getRatingDistribution(courseId)) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];

            if (rating != null && rating >= 1 && rating <= 5) {
                distribution.put(rating, count);
            }
        }

        List<ReviewResponse> reviews =
                reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                        .stream()
                        .map(review -> toResponse(review, currentUser))
                        .toList();

        Double average = reviewRepository.getAverageRating(courseId);

        return ResponseEntity.ok(
                new ReviewResponse.ReviewListResponse(
                        average == null ? 0.0 : average,
                        reviewRepository.countByCourseId(course.getId()),
                        distribution,
                        reviews
                )
        );
    }

    @PostMapping("/api/courses/{courseId}/reviews")
    @Transactional
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long courseId,
            @RequestBody ReviewRequest request,
            Authentication authentication) {

        User user = requireUser(authentication);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));

        requireEnrollment(user, courseId);
        validateReview(request);

        if (reviewRepository.existsByStudentIdAndCourseId(
                user.getId(), courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Bạn đã đánh giá khóa học này. Hãy chỉnh sửa đánh giá hiện có.");
        }

        Review review = new Review();
        review.setStudent(user);
        review.setCourse(course);
        review.setRating(request.rating());
        review.setComment(normalizeComment(request.comment()));

        Review saved = reviewRepository.save(review);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(saved, user));
    }

    @PutMapping("/api/courses/{courseId}/reviews/{reviewId}")
    @Transactional
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long courseId,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest request,
            Authentication authentication) {

        User user = requireUser(authentication);
        requireEnrollment(user, courseId);
        validateReview(request);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá"));

        if (!review.getCourse().getId().equals(courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Đánh giá không thuộc khóa học này");
        }

        if (!review.getStudent().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Bạn không thể sửa đánh giá của người khác");
        }

        review.setRating(request.rating());
        review.setComment(normalizeComment(request.comment()));

        return ResponseEntity.ok(toResponse(reviewRepository.save(review), user));
    }

    @PostMapping("/api/reviews/{reviewId}/helpful")
    @Transactional
    public ResponseEntity<ReviewResponse.HelpfulResponse> toggleHelpful(
            @PathVariable Long reviewId,
            Authentication authentication) {

        User user = requireUser(authentication);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá"));

        boolean alreadyHelpful = helpfulRepository
                .existsByReview_IdAndUser_Id(reviewId, user.getId());

        if (alreadyHelpful) {
            helpfulRepository.deleteByReview_IdAndUser_Id(
                    reviewId, user.getId());
        } else {
            helpfulRepository.save(new ReviewHelpful(review, user));
        }

        helpfulRepository.flush();

        boolean helpfulNow = !alreadyHelpful;
        long count = helpfulRepository.countByReview_Id(reviewId);

        return ResponseEntity.ok(
                new ReviewResponse.HelpfulResponse(helpfulNow, count));
    }

    // 🎯 FIX LỖI 404: Endpoint bật/tắt Like cho từng Reply
    @PostMapping("/api/reviews/replies/{replyId}/helpful")
    @Transactional
    public ResponseEntity<ReviewResponse.HelpfulResponse> toggleReplyHelpful(
            @PathVariable Long replyId,
            Authentication authentication) {

        User user = requireUser(authentication);

        ReviewReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy câu trả lời"));

        boolean alreadyHelpful = replyHelpfulRepository
                .existsByReply_IdAndUser_Id(replyId, user.getId());

        if (alreadyHelpful) {
            replyHelpfulRepository.deleteByReply_IdAndUser_Id(
                    replyId, user.getId());
        } else {
            replyHelpfulRepository.save(new ReviewReplyHelpful(reply, user));
        }

        replyHelpfulRepository.flush();

        boolean helpfulNow = !alreadyHelpful;
        long count = replyHelpfulRepository.countByReply_Id(replyId);

        return ResponseEntity.ok(
                new ReviewResponse.HelpfulResponse(helpfulNow, count));
    }

    @PostMapping("/api/reviews/{reviewId}/replies")
    @Transactional
    public ResponseEntity<ReviewResponse.ReplyResponse> createReply(
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequest request,
            Authentication authentication) {

        User user = requireUser(authentication);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá"));

        requireEnrollment(user, review.getCourse().getId());

        if (request == null || request.comment() == null
                || request.comment().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Nội dung trả lời không được để trống");
        }

        if (request.comment().trim().length() > 5000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Nội dung trả lời quá dài");
        }

        ReviewReply parentReply = null;
        if (request.parentId() != null) {
            parentReply = replyRepository.findById(request.parentId()).orElse(null);
        }

        ReviewReply reply = replyRepository.save(
                new ReviewReply(review, user, request.comment().trim(), parentReply));

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ReviewResponse.ReplyResponse(
                        reply.getId(),
                        user.getId(),
                        user.getFullName(),
                        user.getAvatarUrl(),
                        reply.getComment(),
                        reply.getCreatedAt(),
                        request.parentId(),
                        0L,
                        false
                )
        );
    }

    private ReviewResponse toResponse(Review review, User currentUser) {
        Long reviewId = review.getId();

        List<ReviewResponse.ReplyResponse> replies =
                replyRepository.findByReview_IdOrderByCreatedAtAsc(reviewId)
                        .stream()
                        .map(reply -> {
                            boolean isReplyHelpful = currentUser != null
                                    && replyHelpfulRepository.existsByReply_IdAndUser_Id(reply.getId(), currentUser.getId());
                            long replyHelpfulCount = replyHelpfulRepository.countByReply_Id(reply.getId());
                            Long parentId = reply.getParent() != null ? reply.getParent().getId() : null;

                            return new ReviewResponse.ReplyResponse(
                                    reply.getId(),
                                    reply.getUser().getId(),
                                    reply.getUser().getFullName(),
                                    reply.getUser().getAvatarUrl(),
                                    reply.getComment(),
                                    reply.getCreatedAt(),
                                    parentId,
                                    replyHelpfulCount,
                                    isReplyHelpful
                            );
                        })
                        .toList();

        boolean helpfulByMe = currentUser != null
                && helpfulRepository.existsByReview_IdAndUser_Id(
                        reviewId, currentUser.getId());

        return new ReviewResponse(
                reviewId,
                review.getStudent().getId(),
                review.getStudent().getFullName(),
                review.getStudent().getAvatarUrl(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                helpfulRepository.countByReview_Id(reviewId),
                helpfulByMe,
                currentUser != null
                        && currentUser.getId().equals(review.getStudent().getId()),
                replies
        );
    }

    private User getOptionalUser(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        return userRepository.findByEmail(authentication.getName())
                .orElse(null);
    }

    private User requireUser(Authentication authentication) {
        User user = getOptionalUser(authentication);

        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }

        return user;
    }

    private void requireEnrollment(User user, Long courseId) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(
                user.getId(), courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn cần đăng ký khóa học trước khi sử dụng chức năng này");
        }
    }

    private void validateReview(ReviewRequest request) {
        if (request == null || request.rating() == null
                || request.rating() < 1 || request.rating() > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Điểm đánh giá phải từ 1 đến 5 sao");
        }

        if (request.comment() != null
                && request.comment().trim().length() > 5000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Nội dung đánh giá quá dài");
        }
    }

    private String normalizeComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        return comment.trim();
    }
}