package com.dischargebridge.discharge.dto;

import jakarta.validation.constraints.NotBlank;

public class MedicalClearanceRequest {
    @NotBlank(message = "Clinical discharge summary / clearance notes are required")
    private String clinicalNotes;

    public MedicalClearanceRequest() {}

    public MedicalClearanceRequest(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }
}
