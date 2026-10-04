package lms_backend_core.config;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

@Component
public class UploadedFileResolver {

    private final UploadResourceConfig uploadResourceConfig;

    public UploadedFileResolver(UploadResourceConfig uploadResourceConfig) {
        this.uploadResourceConfig = uploadResourceConfig;
    }

    public Path resolve(String fileUrl) {
        Path root = uploadResourceConfig.getUploadDirectory().toAbsolutePath().normalize();
        String path = fileUrl.replace('\\', '/');
        try {
            if (path.contains("://")) {
                path = URI.create(path.replace(" ", "%20")).getPath();
            }
            path = URLDecoder.decode(path.replace("+", "%2B"), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment URL is invalid.");
        }

        int uploadsIndex = path.lastIndexOf("/uploads/");
        String relativePath;
        if (uploadsIndex >= 0) {
            relativePath = path.substring(uploadsIndex + "/uploads/".length());
        } else if (path.startsWith("uploads/")) {
            relativePath = path.substring("uploads/".length());
        } else if (path.startsWith("lms-frontend/app/uploads/")) {
            relativePath = path.substring("lms-frontend/app/uploads/".length());
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment is not stored in uploads.");
        }

        Path file = root.resolve(relativePath).normalize();
        if (!file.startsWith(root)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment file not found.");
        }
        return file;
    }
}
