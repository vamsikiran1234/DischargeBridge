package com.dischargebridge.discharge;

import com.dischargebridge.admission.Admission;
import com.dischargebridge.admission.AdmissionRepository;
import com.dischargebridge.audit.AuditService;
import com.dischargebridge.blocker.BlockerRepository;
import com.dischargebridge.blocker.BlockerStatus;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.department.Department;
import com.dischargebridge.department.DepartmentRepository;
import com.dischargebridge.discharge.dto.DischargeCaseDetailDto;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;
import com.dischargebridge.discharge.dto.InitiateDischargeRequest;
import com.dischargebridge.discharge.dto.MedicalClearanceRequest;
import com.dischargebridge.task.DepartmentTask;
import com.dischargebridge.task.TaskRepository;
import com.dischargebridge.task.TaskStatus;
import com.dischargebridge.user.HospitalUser;
import com.dischargebridge.user.Role;
import com.dischargebridge.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DischargeService {

    private final DischargeRepository dischargeRepository;
    private final AdmissionRepository admissionRepository;
    private final TaskRepository taskRepository;
    private final BlockerRepository blockerRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ReadinessService readinessService;
    private final AuditService auditService;

    public DischargeService(DischargeRepository dischargeRepository,
                            AdmissionRepository admissionRepository,
                            TaskRepository taskRepository,
                            BlockerRepository blockerRepository,
                            DepartmentRepository departmentRepository,
                            UserRepository userRepository,
                            ReadinessService readinessService,
                            AuditService auditService) {
        this.dischargeRepository = dischargeRepository;
        this.admissionRepository = admissionRepository;
        this.taskRepository = taskRepository;
        this.blockerRepository = blockerRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.readinessService = readinessService;
        this.auditService = auditService;
    }

    public List<DischargeCase> getAllDischarges() {
        return dischargeRepository.findAllRecent();
    }

    public List<DischargeCase> getActiveDischarges() {
        return dischargeRepository.findActiveDischarges();
    }

    public DischargeCase getDischargeById(Long id) {
        return dischargeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Discharge case not found with ID: " + id));
    }

    public DischargeReadinessDto getReadinessSummary(Long id) {
        DischargeCase dc = getDischargeById(id);
        return readinessService.calculateReadiness(dc);
    }

    public DischargeCaseDetailDto getDischargeDetails(Long id) {
        DischargeCase dc = getDischargeById(id);
        DischargeReadinessDto readiness = readinessService.calculateReadiness(dc);
        List<DepartmentTask> tasks = taskRepository.findByDischargeCaseId(id);
        List<TaskBlocker> blockers = blockerRepository.findByDischargeCaseId(id);
        var auditHistory = auditService.getCaseAuditHistory(id);

        return new DischargeCaseDetailDto(dc, readiness, tasks, blockers, auditHistory);
    }

    @Transactional
    public DischargeCase initiateDischarge(InitiateDischargeRequest request, String initiatorEmail) {
        HospitalUser initiator = userRepository.findByEmail(initiatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Admission admission = admissionRepository.findById(request.getAdmissionId())
                .orElseThrow(() -> new IllegalArgumentException("Admission not found with ID: " + request.getAdmissionId()));

        if (dischargeRepository.existsByAdmissionId(admission.getId())) {
            throw new IllegalStateException("A discharge workflow has already been initiated for Admission: " + admission.getAdmissionReference());
        }

        DischargeCase dischargeCase = new DischargeCase(admission, initiator);
        if (request.getClinicalDischargeNotes() != null) {
            dischargeCase.setClinicalDischargeNotes(request.getClinicalDischargeNotes());
        }

        // If initiated by a doctor and immediate clearance requested:
        if (request.isRecordMedicalClearanceImmediately() && initiator.getRole() == Role.DOCTOR) {
            dischargeCase.setMedicalClearanceAt(LocalDateTime.now());
            dischargeCase.setClearedByDoctor(initiator);
            dischargeCase.setDischargeStatus(DischargeStatus.IN_PROGRESS);
        } else {
            dischargeCase.setDischargeStatus(DischargeStatus.INITIATED);
        }

        DischargeCase saved = dischargeRepository.save(dischargeCase);

        // Generate Standard Department Tasks
        createStandardTasksForDischarge(saved);

        // Audit Record
        auditService.record(saved.getId(), initiator, "INITIATE_DISCHARGE", "DischargeCase", saved.getId(), null, saved.getDischargeStatus().name());

        return saved;
    }

    private void createStandardTasksForDischarge(DischargeCase dc) {
        // Find departments
        Department docDept = dc.getAdmission().getDepartment();
        Department pharmDept = departmentRepository.findByCode("PHARMACY").orElse(docDept);
        Department billDept = departmentRepository.findByCode("BILLING").orElse(docDept);
        Department nurseDept = departmentRepository.findByCode("NURSING").orElse(docDept);

        // 1. Doctor: Discharge Summary
        DepartmentTask task1 = new DepartmentTask(dc, docDept, "Discharge Summary & Prescription",
                "Complete clinical discharge summary and write post-discharge prescription.", true, LocalDateTime.now().plusHours(2));
        if (dc.getMedicalClearanceAt() != null) {
            task1.setTaskStatus(TaskStatus.COMPLETED);
            task1.setCompletedAt(LocalDateTime.now());
            task1.setCompletedBy(dc.getClearedByDoctor());
            task1.setCompletionNotes("Medical clearance granted on initiation");
        }

        // 2. Pharmacy: Medication Preparation
        DepartmentTask task2 = new DepartmentTask(dc, pharmDept, "Medication Preparation & Counseling",
                "Verify prescribed medications, prepare take-home pharmacy kit, and prepare patient counseling instructions.", true, LocalDateTime.now().plusHours(3));

        // 3. Billing: Final Billing & Insurance TPA Clearance
        DepartmentTask task3 = new DepartmentTask(dc, billDept, "Final Billing & Insurance Clearance",
                "Audit unbilled medication/bed charges, process TPA insurance claim settlement, and collect co-pay.", true, LocalDateTime.now().plusHours(3));

        // 4. Nursing: Nursing Handover & Vitals Check
        DepartmentTask task4 = new DepartmentTask(dc, nurseDept, "Nursing Handover & Patient Education",
                "Conduct final vitals assessment, remove IV cannula/catheters, deliver take-home instructions, and issue discharge folder.", true, LocalDateTime.now().plusHours(4));

        taskRepository.saveAll(List.of(task1, task2, task3, task4));
    }

    @Transactional
    public DischargeCase recordMedicalClearance(Long dischargeId, MedicalClearanceRequest request, String doctorEmail) {
        HospitalUser doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (doctor.getRole() != Role.DOCTOR && doctor.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only an authorized clinician (Doctor) can record medical clearance.");
        }

        DischargeCase dc = getDischargeById(dischargeId);
        String oldStatus = dc.getDischargeStatus().name();

        dc.setMedicalClearanceAt(LocalDateTime.now());
        dc.setClearedByDoctor(doctor);
        if (request.getClinicalNotes() != null) {
            dc.setClinicalDischargeNotes(request.getClinicalNotes());
        }

        // Complete the Doctor discharge summary task if pending
        List<DepartmentTask> tasks = taskRepository.findByDischargeCaseId(dc.getId());
        for (DepartmentTask t : tasks) {
            if (t.getTaskName().contains("Discharge Summary") && t.getTaskStatus() != TaskStatus.COMPLETED) {
                t.setTaskStatus(TaskStatus.COMPLETED);
                t.setCompletedAt(LocalDateTime.now());
                t.setCompletedBy(doctor);
                t.setCompletionNotes("Clinician approved clearance: " + request.getClinicalNotes());
                taskRepository.save(t);
                auditService.record(dc.getId(), doctor, "COMPLETE_TASK", "DepartmentTask", t.getId(), "PENDING", "COMPLETED");
            }
        }

        // Update overall case status
        DischargeReadinessDto readiness = readinessService.calculateReadiness(dc);
        if (readiness.isReadyForFinalHandover()) {
            dc.setDischargeStatus(DischargeStatus.READY_FOR_FINAL_HANDOVER);
        } else if (readiness.getBlockedTasks() > 0) {
            dc.setDischargeStatus(DischargeStatus.BLOCKED);
        } else {
            dc.setDischargeStatus(DischargeStatus.IN_PROGRESS);
        }

        DischargeCase saved = dischargeRepository.save(dc);
        auditService.record(saved.getId(), doctor, "RECORD_MEDICAL_CLEARANCE", "DischargeCase", saved.getId(), oldStatus, saved.getDischargeStatus().name());

        return saved;
    }

    @Transactional
    public DischargeCase completeFinalHandover(Long dischargeId, String coordinatorEmail) {
        HospitalUser coordinator = userRepository.findByEmail(coordinatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (coordinator.getRole() != Role.COORDINATOR && coordinator.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only an authorized Discharge Coordinator or Admin can complete the final handover.");
        }

        DischargeCase dc = getDischargeById(dischargeId);

        if (dc.getDischargeStatus() == DischargeStatus.COMPLETED) {
            throw new IllegalStateException("Discharge has already been completed.");
        }

        // Verify readiness criteria:
        DischargeReadinessDto readiness = readinessService.calculateReadiness(dc);
        if (!readiness.isReadyForFinalHandover()) {
            throw new IllegalStateException("Cannot complete discharge: Mandatory clinical clearance or operational department tasks remain incomplete/blocked.");
        }

        String oldStatus = dc.getDischargeStatus().name();
        dc.setDischargeStatus(DischargeStatus.COMPLETED);
        dc.setCompletedAt(LocalDateTime.now());
        dc.setCompletedBy(coordinator);

        // Update admission status
        Admission admission = dc.getAdmission();
        admission.setAdmissionStatus("DISCHARGED");
        admissionRepository.save(admission);

        DischargeCase saved = dischargeRepository.save(dc);
        auditService.record(saved.getId(), coordinator, "FINAL_HANDOVER_COMPLETED", "DischargeCase", saved.getId(), oldStatus, "COMPLETED");

        return saved;
    }
}
