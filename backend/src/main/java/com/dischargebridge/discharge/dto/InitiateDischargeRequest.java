package com.dischargebridge.discharge.dto;

import jakarta.validation.constraints.NotNull;

public class InitiateDischargeRequest {
    @NotNull(message = "Admission ID is required")
    private Long admissionId;

    private String clinicalDischargeNotes;
    private boolean recordMedicalClearanceImmediately = false;

    public InitiateDischargeRequest() {}

    public Long getAdmissionId() {
        return admissionId;
    }

    public void setAdmissionId(Long admissionId) {
        this.admissionId = admissionId;
    }

    public String getClinicalDischargeNotes() {
        return clinicalDischargeNotes;
    }

    public void setClinicalDischargeNotes(String clinicalDischargeNotes) {
        this.clinicalDischargeNotes = clinicalDischargeNotes;
    }

    public boolean isRecordMedicalClearanceImmediately() {
        return recordMedicalClearanceImmediately;
    }

    public void setRecordMedicalClearanceImmediately(boolean recordMedicalClearanceImmediately) {
        this.recordMedicalClearanceImmediately = recordMedicalClearanceImmediately;
    }
}
