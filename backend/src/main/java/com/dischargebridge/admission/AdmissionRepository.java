package com.dischargebridge.admission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    Optional<Admission> findByAdmissionReference(String admissionReference);
    boolean existsByAdmissionReference(String admissionReference);
    List<Admission> findByAdmissionStatus(String admissionStatus);
    List<Admission> findByAdmissionReferenceContainingIgnoreCaseOrPatientDisplayNameContainingIgnoreCase(String ref, String name);
}
