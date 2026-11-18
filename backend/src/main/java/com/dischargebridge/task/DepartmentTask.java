package com.dischargebridge.task;

import com.dischargebridge.department.Department;
import com.dischargebridge.discharge.DischargeCase;
import com.dischargebridge.user.HospitalUser;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "department_tasks")
public class DepartmentTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discharge_case_id", nullable = false)
    @JsonIgnore
    private DischargeCase dischargeCase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to")
    private HospitalUser assignedTo;

    @Column(nullable = false, length = 150)
    private String taskName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaskStatus taskStatus = TaskStatus.PENDING;

    @Column(nullable = false)
    private boolean mandatory = true;

    private LocalDateTime dueAt;

    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "completed_by_id")
    private HospitalUser completedBy;

    @Column(length = 500)
    private String completionNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DepartmentTask() {}

    public DepartmentTask(DischargeCase dischargeCase, Department department, String taskName, String description, boolean mandatory, LocalDateTime dueAt) {
        this.dischargeCase = dischargeCase;
        this.department = department;
        this.taskName = taskName;
        this.description = description;
        this.mandatory = mandatory;
        this.dueAt = dueAt;
        this.taskStatus = TaskStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DischargeCase getDischargeCase() {
        return dischargeCase;
    }

    public void setDischargeCase(DischargeCase dischargeCase) {
        this.dischargeCase = dischargeCase;
    }

    public Long getDischargeCaseId() {
        return dischargeCase != null ? dischargeCase.getId() : null;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public HospitalUser getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(HospitalUser assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(TaskStatus taskStatus) {
        this.taskStatus = taskStatus;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
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

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
