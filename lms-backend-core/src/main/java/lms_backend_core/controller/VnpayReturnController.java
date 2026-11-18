package lms_backend_core.controller;

import lms_backend_core.config.VnpayProperties;
import lms_backend_core.service.VnpayPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class VnpayReturnController {
    private final VnpayPaymentService paymentService;
    private final VnpayProperties properties;

    @GetMapping("/payment/vnpay/return")
    public ResponseEntity<Void> handleReturn(@RequestParam Map<String, String> parameters) {
        Map<String, String> result = paymentService.processReturn(new LinkedHashMap<>(parameters));
        UriComponentsBuilder redirect = UriComponentsBuilder.fromUriString(properties.getFrontendUrl())
                .replacePath("/payment/vnpay/return");

        result.forEach(redirect::queryParam);
        return ResponseEntity.status(HttpStatus.SEE_OTHER)
                .location(redirect.build().encode().toUri())
                .build();
    }
}
