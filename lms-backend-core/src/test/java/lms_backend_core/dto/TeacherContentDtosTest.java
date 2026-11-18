package lms_backend_core.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import lms_backend_core.entity.QuestionBank;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TeacherContentDtosTest {

    @Test
    void questionViewConvertsJsonNodeOptionsToPlainJsonValues() throws Exception {
        QuestionBank question = new QuestionBank();
        question.setOptionsJson(new ObjectMapper().readTree("""
                [{"id":"A","text":"First"},{"id":"B","text":"Second"}]
                """));

        TeacherContentDtos.QuestionView view = TeacherContentDtos.QuestionView.from(question);

        assertInstanceOf(List.class, view.optionsJson());
        assertEquals(List.of(
                Map.of("id", "A", "text", "First"),
                Map.of("id", "B", "text", "Second")), view.optionsJson());
    }

    @Test
    void questionInputOptionsCanBeConvertedFromPlainJsonValues() {
        List<Map<String, String>> options = List.of(
                Map.of("id", "A", "text", "First"),
                Map.of("id", "B", "text", "Second"));

        var jsonNode = TeacherContentDtos.toJsonNode(options);

        assertTrue(jsonNode.isArray());
        assertEquals("First", jsonNode.get(0).get("text").asText());
    }
}
