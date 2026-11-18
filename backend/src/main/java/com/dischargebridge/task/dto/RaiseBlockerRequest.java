package com.dischargebridge.task.dto;

import jakarta.validation.constraints.NotBlank;

public class RaiseBlockerRequest {
    @NotBlank(message = "Blocker reason is required")
    private String reason;

    public RaiseBlockerRequest() {}

    public RaiseBlockerRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
