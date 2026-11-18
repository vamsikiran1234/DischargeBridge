package com.dischargebridge.admission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateAdmissionRequest {
    @NotBlank(message = "Patient reference is required")
    private String patientReference;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private String ageGender;
    private String primaryDiagnosis;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Bed reference is required")
    private String bedReference;

    public CreateAdmissionRequest() {}

    public String getPatientReference() {
        return patientReference;
    }

    public void setPatientReference(String patientReference) {
        this.patientReference = patientReference;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
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

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getBedReference() {
        return bedReference;
    }

    public void setBedReference(String bedReference) {
        this.bedReference = bedReference;
    }
}
