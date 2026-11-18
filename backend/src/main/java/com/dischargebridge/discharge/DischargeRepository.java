package com.dischargebridge.discharge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DischargeRepository extends JpaRepository<DischargeCase, Long> {

    @Query("SELECT d FROM DischargeCase d WHERE d.admission.id = :admissionId")
    Optional<DischargeCase> findByAdmissionId(@Param("admissionId") Long admissionId);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM DischargeCase d WHERE d.admission.id = :admissionId")
    boolean existsByAdmissionId(@Param("admissionId") Long admissionId);

    List<DischargeCase> findByDischargeStatus(DischargeStatus dischargeStatus);

    @Query("SELECT d FROM DischargeCase d WHERE d.dischargeStatus NOT IN ('COMPLETED', 'CANCELLED') ORDER BY d.startedAt DESC")
    List<DischargeCase> findActiveDischarges();

    @Query("SELECT d FROM DischargeCase d ORDER BY d.startedAt DESC")
    List<DischargeCase> findAllRecent();
}
