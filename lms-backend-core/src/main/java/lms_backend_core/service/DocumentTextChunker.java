package lms_backend_core.service;

import java.util.ArrayList;
import java.util.List;

public final class DocumentTextChunker {

    private static final int MAX_CHUNK_LENGTH = 1200;
    private static final int OVERLAP_LENGTH = 160;

    private DocumentTextChunker() {
    }

    public static List<String> split(String text) {
        String normalized = text
                .replaceAll("(?<=\\p{L})-\\s*\\R\\s*(?=\\p{Ll})", "")
                .replaceAll("[\\t\\x0B\\f\\r ]+", " ")
                .replaceAll(" *\\n *", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
        if (normalized.isBlank()) return List.of();

        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < normalized.length()) {
            int end = Math.min(start + MAX_CHUNK_LENGTH, normalized.length());
            if (end < normalized.length()) {
                int boundary = Math.max(
                        normalized.lastIndexOf('\n', end),
                        normalized.lastIndexOf(' ', end));
                if (boundary > start + MAX_CHUNK_LENGTH / 2) end = boundary;
            }

            String chunk = normalized.substring(start, end).trim();
            if (!chunk.isEmpty()) chunks.add(chunk);
            if (end == normalized.length()) break;

            int nextStart = Math.max(start + 1, end - OVERLAP_LENGTH);
            while (nextStart < normalized.length() && !Character.isWhitespace(normalized.charAt(nextStart))) {
                nextStart++;
            }
            while (nextStart < normalized.length() && Character.isWhitespace(normalized.charAt(nextStart))) {
                nextStart++;
            }
            start = nextStart;
        }
        return List.copyOf(chunks);
    }
}
