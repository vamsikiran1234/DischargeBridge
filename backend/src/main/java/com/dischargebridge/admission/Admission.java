package com.dischargebridge.admission;

import com.dischargebridge.department.Department;
import com.dischargebridge.patient.Patient;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions")
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String admissionReference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 30)
    private String bedReference;

    @Column(nullable = false)
    private LocalDateTime admittedAt;

    @Column(nullable = false, length = 30)
    private String admissionStatus = "ADMITTED"; // ADMITTED, DISCHARGED

    public Admission() {}

    public Admission(String admissionReference, Patient patient, Department department, String bedReference, LocalDateTime admittedAt) {
        this.admissionReference = admissionReference;
        this.patient = patient;
        this.department = department;
        this.bedReference = bedReference;
        this.admittedAt = admittedAt;
        this.admissionStatus = "ADMITTED";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdmissionReference() {
        return admissionReference;
    }

    public void setAdmissionReference(String admissionReference) {
        this.admissionReference = admissionReference;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getBedReference() {
        return bedReference;
    }

    public void setBedReference(String bedReference) {
        this.bedReference = bedReference;
    }

    public LocalDateTime getAdmittedAt() {
        return admittedAt;
    }

    public void setAdmittedAt(LocalDateTime admittedAt) {
        this.admittedAt = admittedAt;
    }

    public String getAdmissionStatus() {
        return admissionStatus;
    }

    public void setAdmissionStatus(String admissionStatus) {
        this.admissionStatus = admissionStatus;
    }
}
