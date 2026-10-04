package lms_backend_core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
@Slf4j
public class GeminiEmbeddingService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private static final String EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents";

    public GeminiEmbeddingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getEmbedding(String text) {
        return getEmbeddings(List.of(text)).get(0);
    }

    public List<String> getEmbeddings(List<String> texts) {
        if (texts.isEmpty()) return List.of();
        if (texts.size() > 100) {
            throw new IllegalArgumentException("At most 100 texts can be embedded in one request.");
        }

        List<Map<String, Object>> requests = texts.stream()
                .map(text -> Map.<String, Object>of(
                        "model", "models/gemini-embedding-001",
                        "content", Map.of("parts", List.of(Map.of("text", text))),
                        "outputDimensionality", 1536))
                .toList();
        Map<String, Object> requestBody = Map.of("requests", requests);

        Map<?, ?> response;
        try {
            response = webClient.post()
                    .uri(EMBEDDING_URL + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException exception) {
            log.error("Gemini embedding request failed with HTTP status {}", exception.getStatusCode());
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "AI embedding provider rejected the request (HTTP "
                            + exception.getStatusCode().value() + "). Check API key, model, and quota.");
        } catch (WebClientRequestException exception) {
            log.error("Gemini embedding request could not reach the provider ({})",
                    exception.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI embedding service is unavailable.");
        }

        if (response == null || !(response.get("embeddings") instanceof List<?> embeddings)
                || embeddings.size() != texts.size()) {
            throw new IllegalStateException("Embedding API returned an unexpected number of vectors.");
        }

        List<String> vectors = new ArrayList<>(embeddings.size());
        for (Object item : embeddings) {
            if (!(item instanceof Map<?, ?> embedding)
                    || !(embedding.get("values") instanceof List<?> values)
                    || values.size() != 1536
                    || values.stream().anyMatch(value -> !(value instanceof Number))) {
                throw new IllegalStateException("Embedding API did not return a valid 1536-dimensional vector.");
            }
            vectors.add(values.toString());
        }
        return List.copyOf(vectors);
    }
}