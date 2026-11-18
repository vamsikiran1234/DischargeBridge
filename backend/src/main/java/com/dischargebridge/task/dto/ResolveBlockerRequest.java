package com.dischargebridge.task.dto;

public class ResolveBlockerRequest {
    private String resolutionNotes;

    public ResolveBlockerRequest() {}

    public ResolveBlockerRequest(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
