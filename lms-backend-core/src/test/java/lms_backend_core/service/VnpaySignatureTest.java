package lms_backend_core.service;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class VnpaySignatureTest {

    @Test
    void signsSortedUrlEncodedFieldsAndDetectsChanges() {
        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_OrderInfo", "Thanh toan khoa hoc");
        parameters.put("vnp_Amount", "50000000");
        String secret = "sandbox-secret";

        String signature = VnpaySignature.sign(parameters, secret);

        assertEquals("vnp_Amount=50000000&vnp_OrderInfo=Thanh+toan+khoa+hoc",
                VnpaySignature.buildQuery(parameters));
        assertTrue(VnpaySignature.isValid(parameters, signature, secret));
        assertFalse(VnpaySignature.isValid(Map.of(
                "vnp_Amount", "50000001",
                "vnp_OrderInfo", "Thanh toan khoa hoc"), signature, secret));
        assertFalse(VnpaySignature.isValid(parameters, null, secret));
    }
}
