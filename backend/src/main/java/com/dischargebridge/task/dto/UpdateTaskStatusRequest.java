package com.dischargebridge.task.dto;

import com.dischargebridge.task.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTaskStatusRequest {
    @NotNull(message = "Task status is required")
    private TaskStatus status;

    private String notes;

    public UpdateTaskStatusRequest() {}

    public UpdateTaskStatusRequest(TaskStatus status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
