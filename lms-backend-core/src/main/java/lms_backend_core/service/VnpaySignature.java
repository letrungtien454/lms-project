package lms_backend_core.service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public final class VnpaySignature {
    private VnpaySignature() {}

    public static String buildQuery(Map<String, String> parameters) {
        return new TreeMap<>(parameters).entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    public static String sign(Map<String, String> parameters, String secret) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] digest = hmac.doFinal(buildQuery(parameters).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte value : digest) hex.append(String.format("%02x", value));
            return hex.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign VNPay request.", exception);
        }
    }

    public static boolean isValid(Map<String, String> parameters, String suppliedHash, String secret) {
        if (suppliedHash == null || suppliedHash.isBlank()) return false;
        byte[] expected = sign(parameters, secret).getBytes(StandardCharsets.US_ASCII);
        byte[] supplied = suppliedHash.getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(expected, supplied);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
