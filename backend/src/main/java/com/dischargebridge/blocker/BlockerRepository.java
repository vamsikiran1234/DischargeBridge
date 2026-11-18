package com.dischargebridge.blocker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockerRepository extends JpaRepository<TaskBlocker, Long> {

    @Query("SELECT b FROM TaskBlocker b WHERE b.task.id = :taskId")
    List<TaskBlocker> findByTaskId(@Param("taskId") Long taskId);

    List<TaskBlocker> findByBlockerStatus(BlockerStatus status);

    @Query("SELECT b FROM TaskBlocker b WHERE b.task.dischargeCase.id = :dischargeCaseId ORDER BY b.raisedAt DESC")
    List<TaskBlocker> findByDischargeCaseId(@Param("dischargeCaseId") Long dischargeCaseId);

    @Query("SELECT b FROM TaskBlocker b WHERE b.blockerStatus = 'ACTIVE' ORDER BY b.raisedAt ASC")
    List<TaskBlocker> findAllActiveBlockers();
}
