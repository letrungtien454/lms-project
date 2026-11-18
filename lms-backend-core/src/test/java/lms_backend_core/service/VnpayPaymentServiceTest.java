package lms_backend_core.service;

import lms_backend_core.config.VnpayProperties;
import lms_backend_core.entity.PaymentOrder;
import lms_backend_core.entity.PaymentOrderStatus;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.PaymentOrderRepository;
import lms_backend_core.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class VnpayPaymentServiceTest {
    private static final String HASH_SECRET = "sandbox-secret";

    private final VnpayProperties properties = configuredProperties();
    private final PaymentOrderRepository paymentOrderRepository = mock(PaymentOrderRepository.class);
    private final VnpayPaymentService service = new VnpayPaymentService(
            properties,
            paymentOrderRepository,
            mock(CourseRepository.class),
            mock(EnrollmentRepository.class),
            mock(UserRepository.class));

    @Test
    void acceptsSignedReturnParametersWithAdditionalOrderId() {
        PaymentOrder order = PaymentOrder.builder()
                .txnRef("transaction-reference")
                .amount(new BigDecimal("500000.00"))
                .status(PaymentOrderStatus.PAID)
                .build();
        when(paymentOrderRepository.findByTxnRefForUpdate("transaction-reference"))
                .thenReturn(Optional.of(order));

        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_TmnCode", "merchant-code");
        parameters.put("vnp_TxnRef", "transaction-reference");
        parameters.put("vnp_Amount", "50000000");
        parameters.put("vnp_ResponseCode", "00");
        parameters.put("vnp_TransactionStatus", "00");
        String signature = VnpaySignature.sign(parameters, HASH_SECRET);
        parameters.put("orderId", "83");
        parameters.put("vnp_SecureHash", signature);

        Map<String, String> response = service.processIpn(parameters);

        assertEquals("00", response.get("RspCode"));
    }

    private static VnpayProperties configuredProperties() {
        VnpayProperties properties = new VnpayProperties();
        properties.setTmnCode("merchant-code");
        properties.setHashSecret(HASH_SECRET);
        return properties;
    }
}
