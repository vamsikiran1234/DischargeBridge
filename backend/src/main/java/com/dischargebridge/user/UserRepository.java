package com.dischargebridge.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<HospitalUser, Long> {
    Optional<HospitalUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<HospitalUser> findByRole(Role role);
    List<HospitalUser> findByDepartmentId(Long departmentId);
}
