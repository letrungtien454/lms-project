package lms_backend_core.service;

import lms_backend_core.dto.RoadmapDtos;
import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final UserRoadmapRepository userRoadmapRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LearningProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public List<RoadmapDtos.AdminRoadmap> adminList() {
        return roadmapRepository.findAllByOrderByIdAsc().stream()
                .map(RoadmapDtos.AdminRoadmap::from)
                .toList();
    }

    @Transactional
    public RoadmapDtos.AdminRoadmap create(RoadmapDtos.RoadmapInput input) {
        Roadmap roadmap = new Roadmap();
        apply(roadmap, input);
        return RoadmapDtos.AdminRoadmap.from(roadmapRepository.save(roadmap));
    }

    @Transactional
    public RoadmapDtos.AdminRoadmap update(Long id, RoadmapDtos.RoadmapInput input) {
        Roadmap roadmap = roadmapRepository.findByIdForUpdate(id)
                .orElseThrow(() -> notFound("Roadmap not found."));
        apply(roadmap, input);
        return RoadmapDtos.AdminRoadmap.from(roadmapRepository.save(roadmap));
    }

    @Transactional
    public void delete(Long id) {
        Roadmap roadmap = roadmapRepository.findByIdForUpdate(id)
                .orElseThrow(() -> notFound("Roadmap not found."));
        userRoadmapRepository.deleteAllByRoadmapId(roadmap.getId());
        roadmapRepository.delete(roadmap);
    }

    @Transactional(readOnly = true)
    public List<RoadmapDtos.StudentRoadmap> studentList(String email) {
        User student = requireStudent(email);
        Map<Long, UserRoadmap> enrollments = new HashMap<>();
        for (UserRoadmap enrollment : userRoadmapRepository.findAllByStudentId(student.getId())) {
            enrollments.put(enrollment.getRoadmap().getId(), enrollment);
        }

        return roadmapRepository.findAllByOrderByIdAsc().stream()
                .filter(roadmap -> Boolean.TRUE.equals(roadmap.getIsPublished())
                        || enrollments.containsKey(roadmap.getId()))
                .map(roadmap -> studentRoadmap(roadmap, enrollments.get(roadmap.getId()), student.getId()))
                .toList();
    }

    @Transactional
    public RoadmapDtos.StudentRoadmap enroll(String email, Long roadmapId) {
        User student = requireStudent(email);
        Roadmap roadmap = roadmapRepository.findByIdForUpdate(roadmapId)
                .orElseThrow(() -> notFound("Roadmap not found."));
        if (!Boolean.TRUE.equals(roadmap.getIsPublished())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Roadmap not found.");
        }

        UserRoadmap enrollment = userRoadmapRepository.findByStudentIdAndRoadmapId(student.getId(), roadmapId)
                .orElseGet(() -> {
                    UserRoadmap created = new UserRoadmap();
                    created.setStudent(student);
                    created.setRoadmap(roadmap);
                    return userRoadmapRepository.save(created);
                });
        Roadmap withStages = roadmapRepository.findWithStagesById(roadmapId)
                .orElseThrow(() -> notFound("Roadmap not found."));
        return studentRoadmap(withStages, enrollment, student.getId());
    }

    @Transactional
    public void unenroll(String email, Long roadmapId) {
        User student = requireStudent(email);
        if (!roadmapRepository.existsById(roadmapId)) {
            throw notFound("Roadmap not found.");
        }
        userRoadmapRepository.findByStudentIdAndRoadmapId(student.getId(), roadmapId)
                .ifPresent(userRoadmapRepository::delete);
    }

    private void apply(Roadmap roadmap, RoadmapDtos.RoadmapInput input) {
        validateSlug(input.slug(), roadmap.getId());
        List<RoadmapDtos.StageInput> stageInputs = input.stages().stream()
                .sorted(Comparator.comparing(RoadmapDtos.StageInput::orderIndex))
                .toList();
        Set<Integer> orderIndexes = new HashSet<>();
        Set<Long> courseIds = new HashSet<>();
        for (RoadmapDtos.StageInput stage : stageInputs) {
            if (!orderIndexes.add(stage.orderIndex())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stage orderIndex values must be unique.");
            }
            if (stage.courseId() != null) {
                courseIds.add(stage.courseId());
            }
        }

        Map<Long, Course> courses = new HashMap<>();
        if (!courseIds.isEmpty()) {
            for (Course course : courseRepository.findAllById(courseIds)) {
                courses.put(course.getId(), course);
            }
            if (courses.size() != courseIds.size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more course IDs do not exist.");
            }
        }

        roadmap.setTitle(input.title().trim());
        roadmap.setSlug(input.slug().trim());
        roadmap.setDescription(input.description());
        roadmap.setCategory(trimToNull(input.category()));
        roadmap.setDurationWeeks(input.durationWeeks());
        roadmap.setTargetAudience(trimToNull(input.targetAudience()));
        roadmap.setIconUrl(trimToNull(input.iconUrl()));
        roadmap.setColorTheme(trimToNull(input.colorTheme()));
        roadmap.setIsPublished(input.isPublished());

        List<RoadmapStage> stages = new ArrayList<>();
        for (RoadmapDtos.StageInput stageInput : stageInputs) {
            RoadmapStage stage = new RoadmapStage();
            stage.setTitle(stageInput.title().trim());
            stage.setDescription(stageInput.description());
            stage.setOrderIndex(stageInput.orderIndex());
            stage.setDurationWeeks(stageInput.durationWeeks());
            stage.setCourse(stageInput.courseId() == null ? null : courses.get(stageInput.courseId()));
            stages.add(stage);
        }

        roadmap.replaceStages(stages);
    }

    private void validateSlug(String slug, Long currentId) {
        String normalized = slug.trim();
        boolean exists = currentId == null
                ? roadmapRepository.existsBySlug(normalized)
                : roadmapRepository.existsBySlugAndIdNot(normalized, currentId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Roadmap slug already exists.");
        }
    }

    private RoadmapDtos.StudentRoadmap studentRoadmap(Roadmap roadmap, UserRoadmap enrollment, Long studentId) {
        List<RoadmapDtos.StudentStage> stages = roadmap.getStages().stream()
                .map(stage -> {
                    Course course = stage.getCourse();
                    if (course == null) {
                        return new RoadmapDtos.StudentStage(
                                stage.getId(), stage.getTitle(), stage.getDescription(), stage.getOrderIndex(),
                                stage.getDurationWeeks(), null, null, false, 0, 0, 0);
                    }
                    long total = lessonRepository.countByChapterCourseId(course.getId());
                    long completed = progressRepository.countByStudentIdAndLessonChapterCourseIdAndStatus(
                            studentId, course.getId(), LearningProgress.Status.COMPLETED);
                    int progress = total == 0 ? 0 : (int) Math.round(completed * 100.0 / total);
                    boolean courseEnrolled = enrollmentRepository
                            .existsByStudentIdAndCourseId(studentId, course.getId());
                    return new RoadmapDtos.StudentStage(
                            stage.getId(), stage.getTitle(), stage.getDescription(), stage.getOrderIndex(),
                            stage.getDurationWeeks(), course.getId(), course.getTitle(),
                            courseEnrolled, completed, total, progress);
                })
                .toList();
        return RoadmapDtos.StudentRoadmap.from(roadmap, enrollment, stages);
    }

    private User requireStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students may access this resource.");
        }
        return user;
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
