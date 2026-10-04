package lms_backend_core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    private final Path uploadDirectory;

    public UploadResourceConfig(@Value("${app.upload-dir:}") String uploadDirectory) {
        this.uploadDirectory = resolveUploadDirectory(uploadDirectory);
    }

    public Path getUploadDirectory() {
        return uploadDirectory;
    }

    private Path resolveUploadDirectory(String configuredDirectory) {
        if (!configuredDirectory.isBlank()) {
            return Paths.get(configuredDirectory).toAbsolutePath().normalize();
        }

        Path workingDirectory = Paths.get("").toAbsolutePath().normalize();
        return List.of(
                        workingDirectory.resolve("uploads"),
                        workingDirectory.resolve("lms-frontend").resolve("app").resolve("uploads"),
                        workingDirectory.resolve("..").resolve("lms-frontend").resolve("app").resolve("uploads").normalize())
                .stream()
                .filter(Files::isDirectory)
                .findFirst()
                .orElseGet(() -> workingDirectory.resolve("uploads"));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadDirectory.toUri().toString();
        if (!location.endsWith("/")) location += "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
