package lms_backend_core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String outcomes;
    private String requirements;
    private BigDecimal price;
    private String level;
    private String thumbnailUrl;
    private String instructorName;
    private String categoryName;
    private List<ChapterResponse> chapters;
}