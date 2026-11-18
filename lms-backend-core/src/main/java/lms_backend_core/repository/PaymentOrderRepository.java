package lms_backend_core.repository;

import lms_backend_core.entity.PaymentOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    @EntityGraph(attributePaths = {"course"})
    List<PaymentOrder> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PaymentOrder p where p.txnRef = :txnRef")
    Optional<PaymentOrder> findByTxnRefForUpdate(@Param("txnRef") String txnRef);

    Optional<PaymentOrder> findByTxnRef(String txnRef);

    Optional<PaymentOrder> findByIdAndStudentId(Long id, Long studentId);
}
