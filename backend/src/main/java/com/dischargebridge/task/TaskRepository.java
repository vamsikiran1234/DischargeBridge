package com.dischargebridge.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<DepartmentTask, Long> {

    @Query("SELECT t FROM DepartmentTask t WHERE t.dischargeCase.id = :dischargeCaseId")
    List<DepartmentTask> findByDischargeCaseId(@Param("dischargeCaseId") Long dischargeCaseId);

    @Query("SELECT t FROM DepartmentTask t WHERE t.department.id = :departmentId")
    List<DepartmentTask> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT t FROM DepartmentTask t WHERE t.assignedTo.id = :userId")
    List<DepartmentTask> findByAssignedToId(@Param("userId") Long userId);

    List<DepartmentTask> findByTaskStatus(TaskStatus status);

    @Query("SELECT t FROM DepartmentTask t WHERE t.department.id = :departmentId AND t.taskStatus = :status")
    List<DepartmentTask> findByDepartmentIdAndTaskStatus(@Param("departmentId") Long departmentId, @Param("status") TaskStatus status);
}
