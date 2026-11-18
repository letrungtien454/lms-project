package lms_backend_core.config;

import lms_backend_core.security.JwtAuthenticationFilter;
import lms_backend_core.security.MaintenanceModeFilter;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final MaintenanceModeFilter maintenanceModeFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public FilterRegistrationBean<MaintenanceModeFilter> maintenanceModeFilterRegistration(
            MaintenanceModeFilter filter) {
        FilterRegistrationBean<MaintenanceModeFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                
                // --- Public Resources ---
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/payment/vnpay/return").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/payments/vnpay/ipn").permitAll()
                .requestMatchers("/api/auth/**", "/api/courses", "/api/courses/**").permitAll()
                
                // --- Lesson Public Requests ---
                .requestMatchers(HttpMethod.GET, "/api/lessons/*/attachments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lessons/*/quiz").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lessons/*/comments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lessons/*/interactive-questions").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lessons/*/attachments/*/download").permitAll()

                // Các thao tác liên quan tới lượt làm bài Quiz yêu cầu đăng nhập
                .requestMatchers("/api/chapters/*/summary-quiz/**").authenticated()

                // --- Protected Endpoints ---
                .requestMatchers(HttpMethod.GET, "/api/courses/*/progress").authenticated()
                .requestMatchers("/api/lessons/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                .requestMatchers("/api/teacher-requests/**").authenticated()
                .requestMatchers("/api/ai/**").authenticated()
                .requestMatchers("/api/enrollments/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"Phiên làm việc hết hạn hoặc chưa đăng nhập.\"}");
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(maintenanceModeFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}