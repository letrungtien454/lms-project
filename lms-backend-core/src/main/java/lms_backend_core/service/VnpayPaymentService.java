package lms_backend_core.service;

import lms_backend_core.config.VnpayProperties;
import lms_backend_core.entity.*;
import lms_backend_core.repository.CourseRepository;
import lms_backend_core.repository.EnrollmentRepository;
import lms_backend_core.repository.PaymentOrderRepository;
import lms_backend_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VnpayPaymentService {
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VnpayProperties properties;
    private final PaymentOrderRepository paymentOrderRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> createPayment(Long courseId, String studentEmail, String clientIp) {
        ensureConfigured();
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản học viên."));
        Course course = courseRepository.findById(courseId)
                .filter(item -> Boolean.TRUE.equals(item.getIsPublished()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học."));

        BigDecimal amount = course.getPrice();
        if (amount == null || amount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khóa học này không cần thanh toán.");
        }
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đăng ký khóa học này rồi.");
        }

        PaymentOrder order = paymentOrderRepository.save(PaymentOrder.builder()
                .txnRef(UUID.randomUUID().toString().replace("-", ""))
                .student(student)
                .course(course)
                .amount(amount)
                .status(PaymentOrderStatus.PENDING)
                .build());

        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_Version", "2.1.0");
        parameters.put("vnp_Command", "pay");
        parameters.put("vnp_TmnCode", properties.getTmnCode());
        parameters.put("vnp_Amount", amount.movePointRight(2).longValueExact() + "");
        parameters.put("vnp_CurrCode", "VND");
        parameters.put("vnp_TxnRef", order.getTxnRef());
        parameters.put("vnp_OrderInfo", "Thanh toan khoa hoc " + course.getId());
        parameters.put("vnp_OrderType", "other");
        parameters.put("vnp_Locale", "vn");
        parameters.put("vnp_ReturnUrl", appendOrderId(properties.getReturnUrl(), order.getId()));
        parameters.put("vnp_IpAddr", normalizeIp(clientIp));
        parameters.put("vnp_CreateDate", VNPAY_DATE.format(order.getCreatedAt().atZoneSameInstant(VIETNAM_ZONE)));
        parameters.put("vnp_ExpireDate", VNPAY_DATE.format(
                order.getCreatedAt().plus(15, ChronoUnit.MINUTES).atZoneSameInstant(VIETNAM_ZONE)));

        String query = VnpaySignature.buildQuery(parameters);
        String secureHash = VnpaySignature.sign(parameters, properties.getHashSecret());
        return Map.of(
                "paymentUrl", properties.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash,
                "orderId", order.getId(),
                "amount", amount);
    }

    @Transactional
    public Map<String, String> processIpn(Map<String, String> requestParameters) {
        Map<String, String> signedParameters = new LinkedHashMap<>(requestParameters);
        String suppliedHash = signedParameters.remove("vnp_SecureHash");
        signedParameters.remove("vnp_SecureHashType");

        if (!configured() || !VnpaySignature.isValid(signedParameters, suppliedHash, properties.getHashSecret())) {
            return ipnResponse("97", "Invalid signature");
        }
        if (!properties.getTmnCode().equals(requestParameters.get("vnp_TmnCode"))) {
            return ipnResponse("97", "Invalid merchant");
        }

        String transactionReference = requestParameters.get("vnp_TxnRef");
        if (transactionReference == null || transactionReference.isBlank()) {
            return ipnResponse("01", "Order not found");
        }
        PaymentOrder order = paymentOrderRepository.findByTxnRefForUpdate(transactionReference)
                .orElse(null);
        if (order == null) return ipnResponse("01", "Order not found");

        long expectedAmount = order.getAmount().movePointRight(2).longValueExact();
        if (!String.valueOf(expectedAmount).equals(requestParameters.get("vnp_Amount"))) {
            return ipnResponse("04", "Invalid amount");
        }
        if (order.getStatus() == PaymentOrderStatus.PAID) return ipnResponse("00", "Confirm Success");

        boolean paymentSucceeded = "00".equals(requestParameters.get("vnp_ResponseCode"))
                && "00".equals(requestParameters.get("vnp_TransactionStatus"));
        if (!paymentSucceeded) {
            order.setStatus(PaymentOrderStatus.FAILED);
            paymentOrderRepository.save(order);
            return ipnResponse("00", "Confirm Success");
        }

        order.setStatus(PaymentOrderStatus.PAID);
        order.setVnpTransactionNo(requestParameters.get("vnp_TransactionNo"));
        order.setBankCode(requestParameters.get("vnp_BankCode"));
        order.setPaidAt(java.time.OffsetDateTime.now(VIETNAM_ZONE));
        paymentOrderRepository.save(order);

        if (!enrollmentRepository.existsByStudentIdAndCourseId(order.getStudent().getId(), order.getCourse().getId())) {
            enrollmentRepository.save(Enrollment.builder()
                    .student(order.getStudent())
                    .course(order.getCourse())
                    .amountPaid(order.getAmount())
                    .build());
        }
        return ipnResponse("00", "Confirm Success");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatus(Long orderId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản học viên."));
        PaymentOrder order = paymentOrderRepository.findByIdAndStudentId(orderId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch."));
        return Map.of(
                "orderId", order.getId(),
                "courseId", order.getCourse().getId(),
                "status", order.getStatus().name(),
                "amount", order.getAmount());
    }

    private void ensureConfigured() {
        if (!configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "VNPay chưa được cấu hình. Hãy thiết lập VNPAY_TMN_CODE và VNPAY_HASH_SECRET.");
        }
    }

    private boolean configured() {
        return properties.getTmnCode() != null && !properties.getTmnCode().isBlank()
                && properties.getHashSecret() != null && !properties.getHashSecret().isBlank()
                && properties.getPayUrl() != null && !properties.getPayUrl().isBlank()
                && properties.getReturnUrl() != null && !properties.getReturnUrl().isBlank();
    }

    private String appendOrderId(String returnUrl, Long orderId) {
        String separator = returnUrl.contains("?") ? "&" : "?";
        return returnUrl + separator + "orderId=" + URLEncoder.encode(orderId.toString(), StandardCharsets.UTF_8);
    }

    private String normalizeIp(String ip) {
        if (ip == null || ip.isBlank() || "0:0:0:0:0:0:0:1".equals(ip)) return "127.0.0.1";
        return ip.length() > 45 ? ip.substring(0, 45) : ip;
    }

    private Map<String, String> ipnResponse(String code, String message) {
        return Map.of("RspCode", code, "Message", message);
    }
}
