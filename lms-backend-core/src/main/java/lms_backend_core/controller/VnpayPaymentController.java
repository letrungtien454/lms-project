package lms_backend_core.controller;

import jakarta.servlet.http.HttpServletRequest;
import lms_backend_core.service.VnpayPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class VnpayPaymentController {
    private final VnpayPaymentService paymentService;

    @PostMapping("/vnpay/courses/{courseId}")
    public ResponseEntity<Map<String, Object>> createPayment(
            @PathVariable Long courseId,
            Authentication authentication,
            HttpServletRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(
                courseId,
                authentication.getName(),
                request.getRemoteAddr()));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable Long orderId,
            Authentication authentication) {
        return ResponseEntity.ok(paymentService.getStatus(orderId, authentication.getName()));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(@RequestParam Map<String, String> parameters) {
        return ResponseEntity.ok(paymentService.processIpn(new LinkedHashMap<>(parameters)));
    }
}
