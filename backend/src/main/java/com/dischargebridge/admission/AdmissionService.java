package com.dischargebridge.admission;

import com.dischargebridge.admission.dto.CreateAdmissionRequest;
import com.dischargebridge.department.Department;
import com.dischargebridge.department.DepartmentRepository;
import com.dischargebridge.patient.Patient;
import com.dischargebridge.patient.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;

    public AdmissionService(AdmissionRepository admissionRepository,
                            PatientRepository patientRepository,
                            DepartmentRepository departmentRepository) {
        this.admissionRepository = admissionRepository;
        this.patientRepository = patientRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    public List<Admission> getActiveAdmissions() {
        return admissionRepository.findByAdmissionStatus("ADMITTED");
    }

    public Admission getAdmissionById(Long id) {
        return admissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admission not found with ID: " + id));
    }

    public List<Admission> searchAdmissions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getActiveAdmissions();
        }
        return admissionRepository.findByAdmissionReferenceContainingIgnoreCaseOrPatientDisplayNameContainingIgnoreCase(query, query);
    }

    @Transactional
    public Admission createAdmission(CreateAdmissionRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + request.getDepartmentId()));

        Patient patient = patientRepository.findByPatientReference(request.getPatientReference())
                .orElseGet(() -> {
                    Patient p = new Patient(
                            request.getPatientReference(),
                            request.getPatientName(),
                            request.getAgeGender() != null ? request.getAgeGender() : "N/A",
                            request.getPrimaryDiagnosis() != null ? request.getPrimaryDiagnosis() : "General observation"
                    );
                    return patientRepository.save(p);
                });

        String admissionRef = "ADM-" + System.currentTimeMillis() % 100000;
        Admission admission = new Admission(
                admissionRef,
                patient,
                department,
                request.getBedReference(),
                LocalDateTime.now()
        );

        return admissionRepository.save(admission);
    }
}
