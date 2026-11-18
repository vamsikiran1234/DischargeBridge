package com.dischargebridge.config;

import com.dischargebridge.admission.Admission;
import com.dischargebridge.admission.AdmissionRepository;
import com.dischargebridge.audit.AuditService;
import com.dischargebridge.blocker.BlockerRepository;
import com.dischargebridge.blocker.BlockerStatus;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.department.Department;
import com.dischargebridge.department.DepartmentRepository;
import com.dischargebridge.discharge.DischargeCase;
import com.dischargebridge.discharge.DischargeRepository;
import com.dischargebridge.discharge.DischargeStatus;
import com.dischargebridge.patient.Patient;
import com.dischargebridge.patient.PatientRepository;
import com.dischargebridge.task.DepartmentTask;
import com.dischargebridge.task.TaskRepository;
import com.dischargebridge.task.TaskStatus;
import com.dischargebridge.user.HospitalUser;
import com.dischargebridge.user.Role;
import com.dischargebridge.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AdmissionRepository admissionRepository;
    private final DischargeRepository dischargeRepository;
    private final TaskRepository taskRepository;
    private final BlockerRepository blockerRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           PatientRepository patientRepository,
                           AdmissionRepository admissionRepository,
                           DischargeRepository dischargeRepository,
                           TaskRepository taskRepository,
                           BlockerRepository blockerRepository,
                           AuditService auditService,
                           PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.admissionRepository = admissionRepository;
        this.dischargeRepository = dischargeRepository;
        this.taskRepository = taskRepository;
        this.blockerRepository = blockerRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            return; // Already initialized
        }

        System.out.println("===> [DischargeBridge] Seeding Initial Hospital Operation Data & Demo Discharges...");

        // 1. Departments
        Department genMed = departmentRepository.save(new Department("General Medicine", "GEN_MED"));
        Department cardio = departmentRepository.save(new Department("Cardiology", "CARDIO"));
        Department ortho = departmentRepository.save(new Department("Orthopedics", "ORTHO"));
        Department nursing = departmentRepository.save(new Department("Nursing Operations", "NURSING"));
        Department pharmacy = departmentRepository.save(new Department("Inpatient Pharmacy", "PHARMACY"));
        Department billing = departmentRepository.save(new Department("Billing & Insurance", "BILLING"));
        Department coordination = departmentRepository.save(new Department("Discharge Coordination", "COORDINATION"));
        Department adminDept = departmentRepository.save(new Department("Hospital Administration", "ADMIN"));

        // 2. Users (Password: password123)
        String encodedPass = passwordEncoder.encode("password123");

        HospitalUser doctor = userRepository.save(new HospitalUser("Dr. Sarah Mitchell, MD", "doctor@dischargebridge.com", encodedPass, Role.DOCTOR, genMed));
        HospitalUser nurse = userRepository.save(new HospitalUser("Elena Rostova, RN", "nurse@dischargebridge.com", encodedPass, Role.NURSE, nursing));
        HospitalUser pharmacist = userRepository.save(new HospitalUser("Marcus Vance, RPh", "pharmacist@dischargebridge.com", encodedPass, Role.PHARMACIST, pharmacy));
        HospitalUser billingStaff = userRepository.save(new HospitalUser("Rachel Adams", "billing@dischargebridge.com", encodedPass, Role.BILLING_STAFF, billing));
        HospitalUser coordinator = userRepository.save(new HospitalUser("David Miller", "coordinator@dischargebridge.com", encodedPass, Role.COORDINATOR, coordination));
        HospitalUser adminUser = userRepository.save(new HospitalUser("Dr. Arthur Sterling", "admin@dischargebridge.com", encodedPass, Role.ADMIN, adminDept));

        // 3. Patients
        Patient p1 = patientRepository.save(new Patient("PAT-1024", "John Miller", "58M", "Acute Community-Acquired Pneumonia"));
        Patient p2 = patientRepository.save(new Patient("PAT-1025", "Sarah Jenkins", "64F", "Atrial Fibrillation with RVR"));
        Patient p3 = patientRepository.save(new Patient("PAT-1026", "Robert Chen", "42M", "Post-op Arthroscopic ACL Reconstruction"));
        Patient p4 = patientRepository.save(new Patient("PAT-1027", "Emily Watson", "29F", "Post-op Laparoscopic Appendectomy"));
        Patient p5 = patientRepository.save(new Patient("PAT-1028", "Arthur Pendelton", "71M", "Hypertensive Urgency (Controlled)"));
        Patient p6 = patientRepository.save(new Patient("PAT-1029", "Linda Zhao", "36F", "Supraventricular Tachycardia (Ablation)"));

        // 4. Admissions
        LocalDateTime now = LocalDateTime.now();
        Admission adm1 = admissionRepository.save(new Admission("DB-1024", p1, genMed, "Bed G-12", now.minusDays(3)));
        Admission adm2 = admissionRepository.save(new Admission("DB-1025", p2, cardio, "Bed C-04", now.minusDays(4)));
        Admission adm3 = admissionRepository.save(new Admission("DB-1026", p3, ortho, "Bed O-09", now.minusDays(2)));
        Admission adm4 = admissionRepository.save(new Admission("DB-1027", p4, genMed, "Bed P-02", now.minusDays(1)));
        Admission adm5 = admissionRepository.save(new Admission("DB-1028", p5, genMed, "Bed G-14", now.minusDays(3)));
        Admission adm6 = admissionRepository.save(new Admission("DB-1029", p6, cardio, "Bed C-08", now.minusDays(2)));

        // 5. Workflows

        // Case 1: DB-1024 -> IN_PROGRESS (3 of 5 tasks complete: Doc clearance complete, Doc summary complete, Nursing complete, Pharmacy pending, Billing pending)
        DischargeCase dc1 = new DischargeCase(adm1, doctor);
        dc1.setDischargeStatus(DischargeStatus.IN_PROGRESS);
        dc1.setMedicalClearanceAt(now.minusHours(3));
        dc1.setClearedByDoctor(doctor);
        dc1.setClinicalDischargeNotes("Patient clinically stable, afebrile for 48 hours, chest auscultation clear. Cleared for oral antibiotics discharge.");
        dc1 = dischargeRepository.save(dc1);

        DepartmentTask t1_doc = new DepartmentTask(dc1, genMed, "Discharge Summary & Prescription",
                "Complete clinical discharge summary and write post-discharge prescription.", true, now.minusHours(1));
        t1_doc.setTaskStatus(TaskStatus.COMPLETED);
        t1_doc.setCompletedAt(now.minusHours(2).minusMinutes(40));
        t1_doc.setCompletedBy(doctor);
        t1_doc.setCompletionNotes("Discharge summary signed and e-prescribed in record");

        DepartmentTask t1_nurse = new DepartmentTask(dc1, nursing, "Nursing Handover & Patient Education",
                "Conduct final vitals assessment, remove IV cannula/catheters, deliver take-home instructions, and issue discharge folder.", true, now.plusHours(1));
        t1_nurse.setTaskStatus(TaskStatus.COMPLETED);
        t1_nurse.setCompletedAt(now.minusMinutes(45));
        t1_nurse.setCompletedBy(nurse);
        t1_nurse.setCompletionNotes("IV line safely discontinued. Vitals BP 122/78, SpO2 99%. Patient handout provided.");

        DepartmentTask t1_pharm = new DepartmentTask(dc1, pharmacy, "Medication Preparation & Counseling",
                "Verify prescribed medications, prepare take-home pharmacy kit, and prepare patient counseling instructions.", true, now.plusMinutes(40));
        t1_pharm.setTaskStatus(TaskStatus.PENDING);
        t1_pharm.setAssignedTo(pharmacist);

        DepartmentTask t1_bill = new DepartmentTask(dc1, billing, "Final Billing & Insurance Clearance",
                "Audit unbilled medication/bed charges, process TPA insurance claim settlement, and collect co-pay.", true, now.plusMinutes(50));
        t1_bill.setTaskStatus(TaskStatus.PENDING);
        t1_bill.setAssignedTo(billingStaff);

        taskRepository.saveAll(List.of(t1_doc, t1_nurse, t1_pharm, t1_bill));
        auditService.record(dc1.getId(), doctor, "INITIATE_DISCHARGE", "DischargeCase", dc1.getId(), null, "IN_PROGRESS");
        auditService.record(dc1.getId(), doctor, "COMPLETE_TASK", "DepartmentTask", t1_doc.getId(), "PENDING", "COMPLETED");
        auditService.record(dc1.getId(), nurse, "COMPLETE_TASK", "DepartmentTask", t1_nurse.getId(), "PENDING", "COMPLETED");

        // Case 2: DB-1025 -> BLOCKED (Pharmacy has raised a blocker)
        DischargeCase dc2 = new DischargeCase(adm2, doctor);
        dc2.setDischargeStatus(DischargeStatus.BLOCKED);
        dc2.setMedicalClearanceAt(now.minusHours(4));
        dc2.setClearedByDoctor(doctor);
        dc2.setClinicalDischargeNotes("Patient stabilized post rhythm conversion. Maintained on Apixaban 5mg BID.");
        dc2 = dischargeRepository.save(dc2);

        DepartmentTask t2_doc = new DepartmentTask(dc2, cardio, "Discharge Summary & Prescription",
                "Complete clinical discharge summary and write post-discharge prescription.", true, now.minusHours(2));
        t2_doc.setTaskStatus(TaskStatus.COMPLETED);
        t2_doc.setCompletedAt(now.minusHours(3));
        t2_doc.setCompletedBy(doctor);

        DepartmentTask t2_pharm = new DepartmentTask(dc2, pharmacy, "Medication Preparation & Counseling",
                "Verify prescribed medications, prepare take-home pharmacy kit, and prepare patient counseling instructions.", true, now.minusHours(1));
        t2_pharm.setTaskStatus(TaskStatus.BLOCKED);
        t2_pharm.setAssignedTo(pharmacist);

        DepartmentTask t2_bill = new DepartmentTask(dc2, billing, "Final Billing & Insurance Clearance",
                "Audit unbilled medication/bed charges, process TPA insurance claim settlement, and collect co-pay.", true, now.plusHours(1));
        t2_bill.setTaskStatus(TaskStatus.IN_PROGRESS);
        t2_bill.setAssignedTo(billingStaff);

        DepartmentTask t2_nurse = new DepartmentTask(dc2, nursing, "Nursing Handover & Patient Education",
                "Conduct final vitals assessment, remove IV cannula/catheters, deliver take-home instructions, and issue discharge folder.", true, now.plusHours(2));
        t2_nurse.setTaskStatus(TaskStatus.PENDING);
        t2_nurse.setAssignedTo(nurse);

        taskRepository.saveAll(List.of(t2_doc, t2_pharm, t2_bill, t2_nurse));

        TaskBlocker b2 = new TaskBlocker(t2_pharm, pharmacist, "Prescribed specialized anticoagulant dosage out of central stock; requested urgent dispensary transfer.");
        blockerRepository.save(b2);

        auditService.record(dc2.getId(), doctor, "INITIATE_DISCHARGE", "DischargeCase", dc2.getId(), null, "IN_PROGRESS");
        auditService.record(dc2.getId(), pharmacist, "RAISE_BLOCKER", "TaskBlocker", b2.getId(), "PENDING", "BLOCKED: " + b2.getReason());

        // Case 3: DB-1026 -> READY_FOR_FINAL_HANDOVER (All mandatory tasks complete)
        DischargeCase dc3 = new DischargeCase(adm3, doctor);
        dc3.setDischargeStatus(DischargeStatus.READY_FOR_FINAL_HANDOVER);
        dc3.setMedicalClearanceAt(now.minusHours(5));
        dc3.setClearedByDoctor(doctor);
        dc3.setClinicalDischargeNotes("Surgical wound dry and intact. Weight-bearing tolerated with brace. Physical therapy protocol issued.");
        dc3 = dischargeRepository.save(dc3);

        DepartmentTask t3_doc = new DepartmentTask(dc3, ortho, "Discharge Summary & Prescription", "Summary complete", true, now.minusHours(4));
        t3_doc.setTaskStatus(TaskStatus.COMPLETED);
        t3_doc.setCompletedAt(now.minusHours(4));
        t3_doc.setCompletedBy(doctor);

        DepartmentTask t3_pharm = new DepartmentTask(dc3, pharmacy, "Medication Preparation & Counseling", "Medications prepared", true, now.minusHours(3));
        t3_pharm.setTaskStatus(TaskStatus.COMPLETED);
        t3_pharm.setCompletedAt(now.minusHours(2).minusMinutes(30));
        t3_pharm.setCompletedBy(pharmacist);
        t3_pharm.setCompletionNotes("Analgesics and anti-inflammatory regimen prepared and labeled with dosage schedule.");

        DepartmentTask t3_bill = new DepartmentTask(dc3, billing, "Final Billing & Insurance Clearance", "Insurance settled", true, now.minusHours(2));
        t3_bill.setTaskStatus(TaskStatus.COMPLETED);
        t3_bill.setCompletedAt(now.minusHours(1).minusMinutes(20));
        t3_bill.setCompletedBy(billingStaff);
        t3_bill.setCompletionNotes("TPA cashless authorization approved ($3,840.00). Co-pay settled ($120.00).");

        DepartmentTask t3_nurse = new DepartmentTask(dc3, nursing, "Nursing Handover & Patient Education", "Nursing handover", true, now.minusHours(1));
        t3_nurse.setTaskStatus(TaskStatus.COMPLETED);
        t3_nurse.setCompletedAt(now.minusMinutes(30));
        t3_nurse.setCompletedBy(nurse);
        t3_nurse.setCompletionNotes("Knee brace fit verified. Mobility instructions explained. Patient escort waiting.");

        taskRepository.saveAll(List.of(t3_doc, t3_pharm, t3_bill, t3_nurse));
        auditService.record(dc3.getId(), doctor, "INITIATE_DISCHARGE", "DischargeCase", dc3.getId(), null, "IN_PROGRESS");
        auditService.record(dc3.getId(), coordinator, "WORKFLOW_READY", "DischargeCase", dc3.getId(), "IN_PROGRESS", "READY_FOR_FINAL_HANDOVER");

        // Case 4: DB-1027 -> COMPLETED
        DischargeCase dc4 = new DischargeCase(adm4, doctor);
        dc4.setDischargeStatus(DischargeStatus.COMPLETED);
        dc4.setMedicalClearanceAt(now.minusHours(6));
        dc4.setClearedByDoctor(doctor);
        dc4.setCompletedAt(now.minusHours(1));
        dc4.setCompletedBy(coordinator);
        dc4.setClinicalDischargeNotes("Uncomplicated post-op recovery. Diet tolerated, suture line clean.");
        dc4 = dischargeRepository.save(dc4);

        adm4.setAdmissionStatus("DISCHARGED");
        admissionRepository.save(adm4);

        DepartmentTask t4_doc = new DepartmentTask(dc4, genMed, "Discharge Summary & Prescription", "Summary complete", true, now.minusHours(5));
        t4_doc.setTaskStatus(TaskStatus.COMPLETED);
        t4_doc.setCompletedAt(now.minusHours(5));
        t4_doc.setCompletedBy(doctor);

        DepartmentTask t4_pharm = new DepartmentTask(dc4, pharmacy, "Medication Preparation & Counseling", "Medications prepared", true, now.minusHours(4));
        t4_pharm.setTaskStatus(TaskStatus.COMPLETED);
        t4_pharm.setCompletedAt(now.minusHours(4));
        t4_pharm.setCompletedBy(pharmacist);

        DepartmentTask t4_bill = new DepartmentTask(dc4, billing, "Final Billing & Insurance Clearance", "Insurance settled", true, now.minusHours(3));
        t4_bill.setTaskStatus(TaskStatus.COMPLETED);
        t4_bill.setCompletedAt(now.minusHours(3));
        t4_bill.setCompletedBy(billingStaff);

        DepartmentTask t4_nurse = new DepartmentTask(dc4, nursing, "Nursing Handover & Patient Education", "Nursing handover", true, now.minusHours(2));
        t4_nurse.setTaskStatus(TaskStatus.COMPLETED);
        t4_nurse.setCompletedAt(now.minusHours(2));
        t4_nurse.setCompletedBy(nurse);

        taskRepository.saveAll(List.of(t4_doc, t4_pharm, t4_bill, t4_nurse));
        auditService.record(dc4.getId(), coordinator, "FINAL_HANDOVER_COMPLETED", "DischargeCase", dc4.getId(), "READY_FOR_FINAL_HANDOVER", "COMPLETED");

        System.out.println("===> [DischargeBridge] Seeding completed successfully. Ready for operations!");
    }
}
