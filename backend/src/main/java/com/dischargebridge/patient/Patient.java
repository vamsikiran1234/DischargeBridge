package com.dischargebridge.patient;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String patientReference;

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(length = 20)
    private String ageGender;

    @Column(length = 255)
    private String primaryDiagnosis;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Patient() {}

    public Patient(String patientReference, String displayName, String ageGender, String primaryDiagnosis) {
        this.patientReference = patientReference;
        this.displayName = displayName;
        this.ageGender = ageGender;
        this.primaryDiagnosis = primaryDiagnosis;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientReference() {
        return patientReference;
    }

    public void setPatientReference(String patientReference) {
        this.patientReference = patientReference;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getAgeGender() {
        return ageGender;
    }

    public void setAgeGender(String ageGender) {
        this.ageGender = ageGender;
    }

    public String getPrimaryDiagnosis() {
        return primaryDiagnosis;
    }

    public void setPrimaryDiagnosis(String primaryDiagnosis) {
        this.primaryDiagnosis = primaryDiagnosis;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
