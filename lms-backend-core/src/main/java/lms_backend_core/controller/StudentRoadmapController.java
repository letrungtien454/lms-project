package lms_backend_core.controller;

import lms_backend_core.dto.RoadmapDtos;
import lms_backend_core.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/roadmaps")
@RequiredArgsConstructor
public class StudentRoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping
    public List<RoadmapDtos.StudentRoadmap> list(Authentication authentication) {
        return roadmapService.studentList(authentication.getName());
    }

    @PostMapping("/{id}/enroll")
    public RoadmapDtos.StudentRoadmap enroll(@PathVariable Long id, Authentication authentication) {
        return roadmapService.enroll(authentication.getName(), id);
    }

    @DeleteMapping("/{id}/enroll")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unenroll(@PathVariable Long id, Authentication authentication) {
        roadmapService.unenroll(authentication.getName(), id);
    }
}
