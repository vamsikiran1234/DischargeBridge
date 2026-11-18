package com.dischargebridge.discharge;

import com.dischargebridge.admission.Admission;
import com.dischargebridge.blocker.BlockerRepository;
import com.dischargebridge.blocker.BlockerStatus;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.department.Department;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;
import com.dischargebridge.patient.Patient;
import com.dischargebridge.task.DepartmentTask;
import com.dischargebridge.task.TaskRepository;
import com.dischargebridge.task.TaskStatus;
import com.dischargebridge.user.HospitalUser;
import com.dischargebridge.user.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReadinessServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private BlockerRepository blockerRepository;

    @InjectMocks
    private ReadinessService readinessService;

    private DischargeCase dischargeCase;
    private Department genMed;
    private Department pharmacy;
    private HospitalUser doctor;

    @BeforeEach
    void setUp() {
        genMed = new Department("General Medicine", "GEN_MED");
        pharmacy = new Department("Inpatient Pharmacy", "PHARMACY");
        doctor = new HospitalUser("Dr. Sarah Mitchell", "doctor@dischargebridge.com", "pass", Role.DOCTOR, genMed);

        Patient patient = new Patient("PAT-101", "Jane Doe", "45F", "Cellulitis");
        Admission admission = new Admission("DB-9999", patient, genMed, "Bed G-01", LocalDateTime.now().minusDays(2));

        dischargeCase = new DischargeCase(admission, doctor);
        dischargeCase.setId(100L);
    }

    @Test
    @DisplayName("Readiness should be false when medical clearance is not recorded")
    void shouldNotBeReadyWithoutMedicalClearance() {
        DepartmentTask task1 = new DepartmentTask(dischargeCase, genMed, "Summary", "desc", true, null);
        task1.setTaskStatus(TaskStatus.COMPLETED);

        when(taskRepository.findByDischargeCaseId(100L)).thenReturn(List.of(task1));
        when(blockerRepository.findByDischargeCaseId(100L)).thenReturn(Collections.emptyList());

        DischargeReadinessDto readiness = readinessService.calculateReadiness(dischargeCase);

        assertFalse(readiness.isMedicalClearanceGranted());
        assertFalse(readiness.isReadyForFinalHandover());
        assertEquals(1, readiness.getCompletedTasks());
    }

    @Test
    @DisplayName("Readiness should be false when tasks are blocked")
    void shouldNotBeReadyWhenBlockerActive() {
        dischargeCase.setMedicalClearanceAt(LocalDateTime.now());

        DepartmentTask task1 = new DepartmentTask(dischargeCase, genMed, "Summary", "desc", true, null);
        task1.setTaskStatus(TaskStatus.COMPLETED);

        DepartmentTask task2 = new DepartmentTask(dischargeCase, pharmacy, "Meds", "desc", true, null);
        task2.setTaskStatus(TaskStatus.BLOCKED);

        TaskBlocker blocker = new TaskBlocker(task2, doctor, "Medicine out of stock");
        blocker.setBlockerStatus(BlockerStatus.ACTIVE);

        when(taskRepository.findByDischargeCaseId(100L)).thenReturn(List.of(task1, task2));
        when(blockerRepository.findByDischargeCaseId(100L)).thenReturn(List.of(blocker));

        DischargeReadinessDto readiness = readinessService.calculateReadiness(dischargeCase);

        assertTrue(readiness.isMedicalClearanceGranted());
        assertEquals(1, readiness.getBlockedTasks());
        assertFalse(readiness.isReadyForFinalHandover());
    }

    @Test
    @DisplayName("Readiness should be true when clearance granted, all mandatory tasks completed, and no active blockers")
    void shouldBeReadyWhenAllConditionsMet() {
        dischargeCase.setMedicalClearanceAt(LocalDateTime.now());

        DepartmentTask task1 = new DepartmentTask(dischargeCase, genMed, "Summary", "desc", true, null);
        task1.setTaskStatus(TaskStatus.COMPLETED);

        DepartmentTask task2 = new DepartmentTask(dischargeCase, pharmacy, "Meds", "desc", true, null);
        task2.setTaskStatus(TaskStatus.COMPLETED);

        when(taskRepository.findByDischargeCaseId(100L)).thenReturn(List.of(task1, task2));
        when(blockerRepository.findByDischargeCaseId(100L)).thenReturn(Collections.emptyList());

        DischargeReadinessDto readiness = readinessService.calculateReadiness(dischargeCase);

        assertTrue(readiness.isMedicalClearanceGranted());
        assertEquals(2, readiness.getCompletedTasks());
        assertEquals(0, readiness.getBlockedTasks());
        assertEquals(0, readiness.getPendingTasks());
        assertTrue(readiness.isReadyForFinalHandover());
    }
}
