package lms_backend_core.config;

import lms_backend_core.entity.*;
import lms_backend_core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo Giảng viên mẫu nếu chưa có
        User teacher = userRepository.findByEmail("trungtien1896@eduflow.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("Lê Trung Tiến")
                .email("trungtien1896@eduflow.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.TEACHER)
                .build())
        );

        // 2. Tạo Danh mục mẫu nếu chưa có
        if (categoryRepository.count() == 0) {
            Category webDev = categoryRepository.save(Category.builder()
                .name("Web Development")
                .slug("web-development")
                .description("Học lập trình Web từ cơ bản đến nâng cao")
                .build());

            Category database = categoryRepository.save(Category.builder()
                .name("Database")
                .slug("database")
                .description("Thiết kế và quản trị CSDL")
                .build());

            Category programming = categoryRepository.save(Category.builder()
                .name("Programming")
                .slug("programming")
                .description("Lập trình căn bản")
                .build());

            // 3. Tạo Khóa học mẫu (Bao gồm cả CÓ PHÍ và MIỄN PHÍ)
            if (courseRepository.count() == 0) {
                // --- KHÓA HỌC CÓ PHÍ ---
                courseRepository.save(Course.builder()
                    .title("Spring Boot & Microservices Masterclass")
                    .description("Khóa học xây dựng hệ thống RESTful API chuẩn production.")
                    .price(new BigDecimal("1500000"))
                    .isPublished(true)
                    .teacher(teacher)
                    .category(database)
                    .build());

                courseRepository.save(Course.builder()
                    .title("Modern Web Development với Next.js 14")
                    .description("Tối ưu trải nghiệm Fullstack Web ứng dụng App Router.")
                    .price(new BigDecimal("900000"))
                    .isPublished(true)
                    .teacher(teacher)
                    .category(webDev)
                    .build());
                
                // --- KHÓA HỌC MIỄN PHÍ (Price = 0) ---
                courseRepository.save(Course.builder()
                    .title("HTML5 & CSS3 Cho Người Mới Bắt Đầu")
                    .description("Học làm giao diện web căn bản hoàn toàn miễn phí.")
                    .price(BigDecimal.ZERO) // Price = 0
                    .isPublished(true)
                    .teacher(teacher)
                    .category(webDev)
                    .build());

                courseRepository.save(Course.builder()
                    .title("Nhập Môn Lập Trình Cho Beginner")
                    .description("Nắm vững tư duy lập trình căn bản.")
                    .price(BigDecimal.ZERO) // Price = 0
                    .isPublished(true)
                    .teacher(teacher)
                    .category(programming)
                    .build());
            }
        }
    }
}