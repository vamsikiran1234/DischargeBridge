package com.dischargebridge.discharge;

import com.dischargebridge.admission.Admission;
import com.dischargebridge.user.HospitalUser;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discharge_cases")
public class DischargeCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admission_id", nullable = false, unique = true)
    private Admission admission;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "initiated_by", nullable = false)
    private HospitalUser initiatedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DischargeStatus dischargeStatus = DischargeStatus.INITIATED;

    @Column(name = "medical_clearance_at")
    private LocalDateTime medicalClearanceAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cleared_by_doctor_id")
    private HospitalUser clearedByDoctor;

    @Column(name = "clinical_discharge_notes", length = 1000)
    private String clinicalDischargeNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "completed_by_id")
    private HospitalUser completedBy;

    @Version
    private Long version;

    public DischargeCase() {}

    public DischargeCase(Admission admission, HospitalUser initiatedBy) {
        this.admission = admission;
        this.initiatedBy = initiatedBy;
        this.dischargeStatus = DischargeStatus.INITIATED;
        this.startedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Admission getAdmission() {
        return admission;
    }

    public void setAdmission(Admission admission) {
        this.admission = admission;
    }

    public HospitalUser getInitiatedBy() {
        return initiatedBy;
    }

    public void setInitiatedBy(HospitalUser initiatedBy) {
        this.initiatedBy = initiatedBy;
    }

    public DischargeStatus getDischargeStatus() {
        return dischargeStatus;
    }

    public void setDischargeStatus(DischargeStatus dischargeStatus) {
        this.dischargeStatus = dischargeStatus;
    }

    public LocalDateTime getMedicalClearanceAt() {
        return medicalClearanceAt;
    }

    public void setMedicalClearanceAt(LocalDateTime medicalClearanceAt) {
        this.medicalClearanceAt = medicalClearanceAt;
    }

    public HospitalUser getClearedByDoctor() {
        return clearedByDoctor;
    }

    public void setClearedByDoctor(HospitalUser clearedByDoctor) {
        this.clearedByDoctor = clearedByDoctor;
    }

    public String getClinicalDischargeNotes() {
        return clinicalDischargeNotes;
    }

    public void setClinicalDischargeNotes(String clinicalDischargeNotes) {
        this.clinicalDischargeNotes = clinicalDischargeNotes;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public HospitalUser getCompletedBy() {
        return completedBy;
    }

    public void setCompletedBy(HospitalUser completedBy) {
        this.completedBy = completedBy;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
