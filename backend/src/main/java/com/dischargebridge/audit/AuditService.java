package com.dischargebridge.audit;

import com.dischargebridge.user.HospitalUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void record(Long dischargeCaseId, HospitalUser actor, String action, String entityType, Long entityId, String oldValue, String newValue) {
        AuditLog log = new AuditLog(dischargeCaseId, actor, action, entityType, entityId, oldValue, newValue);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getCaseAuditHistory(Long dischargeCaseId) {
        return auditLogRepository.findByDischargeCaseIdOrderByCreatedAtDesc(dischargeCaseId);
    }
}
