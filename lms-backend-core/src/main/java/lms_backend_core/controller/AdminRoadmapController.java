package lms_backend_core.controller;

import jakarta.validation.Valid;
import lms_backend_core.dto.RoadmapDtos;
import lms_backend_core.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roadmaps")
@RequiredArgsConstructor
public class AdminRoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping
    @Transactional(readOnly = true)
    public List<RoadmapDtos.AdminRoadmap> list() {
        return roadmapService.adminList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoadmapDtos.AdminRoadmap create(@Valid @RequestBody RoadmapDtos.RoadmapInput input) {
        return roadmapService.create(input);
    }

    @PutMapping("/{id}")
    public RoadmapDtos.AdminRoadmap update(
            @PathVariable Long id,
            @Valid @RequestBody RoadmapDtos.RoadmapInput input) {
        return roadmapService.update(id, input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        roadmapService.delete(id);
    }
}
