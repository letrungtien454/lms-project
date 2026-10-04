package lms_backend_core.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentTextChunkerTest {

    @Test
    void splitsLongTextIntoBoundedOverlappingChunks() {
        String text = "word ".repeat(1000);

        List<String> chunks = DocumentTextChunker.split(text);

        assertTrue(chunks.size() > 1);
        assertTrue(chunks.stream().allMatch(chunk -> chunk.length() <= 1200));
        assertTrue(chunks.get(0).contains(chunks.get(1).substring(0, 40)));
    }

    @Test
    void removesLineBreaksInsideHyphenatedWords() {
        List<String> chunks = DocumentTextChunker.split("quy trình phân tích giao di-\nện website");

        assertEquals(List.of("quy trình phân tích giao diện website"), chunks);
    }

    @Test
    void returnsNoChunksForBlankContent() {
        assertTrue(DocumentTextChunker.split(" \n\t ").isEmpty());
    }
}
