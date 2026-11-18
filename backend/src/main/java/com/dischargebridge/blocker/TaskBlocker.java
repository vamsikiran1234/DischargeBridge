package com.dischargebridge.blocker;

import com.dischargebridge.task.DepartmentTask;
import com.dischargebridge.user.HospitalUser;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_blockers")
public class TaskBlocker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id", nullable = false)
    private DepartmentTask task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "raised_by", nullable = false)
    private HospitalUser raisedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BlockerStatus blockerStatus = BlockerStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resolved_by")
    private HospitalUser resolvedBy;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime raisedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    public TaskBlocker() {}

    public TaskBlocker(DepartmentTask task, HospitalUser raisedBy, String reason) {
        this.task = task;
        this.raisedBy = raisedBy;
        this.reason = reason;
        this.blockerStatus = BlockerStatus.ACTIVE;
        this.raisedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DepartmentTask getTask() {
        return task;
    }

    public void setTask(DepartmentTask task) {
        this.task = task;
    }

    public HospitalUser getRaisedBy() {
        return raisedBy;
    }

    public void setRaisedBy(HospitalUser raisedBy) {
        this.raisedBy = raisedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public BlockerStatus getBlockerStatus() {
        return blockerStatus;
    }

    public void setBlockerStatus(BlockerStatus blockerStatus) {
        this.blockerStatus = blockerStatus;
    }

    public HospitalUser getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(HospitalUser resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getRaisedAt() {
        return raisedAt;
    }

    public void setRaisedAt(LocalDateTime raisedAt) {
        this.raisedAt = raisedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
