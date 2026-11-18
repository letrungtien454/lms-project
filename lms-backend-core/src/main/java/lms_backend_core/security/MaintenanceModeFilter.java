package lms_backend_core.security;

import lms_backend_core.repository.SystemSettingRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
@RequiredArgsConstructor
public class MaintenanceModeFilter extends OncePerRequestFilter {

    private final SystemSettingRepository settingsRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean exempt = path.startsWith("/api/admin/")
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/google");
        if (!path.startsWith("/api/") || exempt) {
            filterChain.doFilter(request, response);
            return;
        }
        boolean maintenanceMode = settingsRepository.findById(1L)
                .map(setting -> setting.isMaintenanceMode())
                .orElse(false);
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                        .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (maintenanceMode && !isAdmin) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                    "{\"message\":\"H\\u1ec7 th\\u1ed1ng \\u0111ang b\\u1ea3o tr\\u00ec. Vui l\\u00f2ng quay l\\u1ea1i sau.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
