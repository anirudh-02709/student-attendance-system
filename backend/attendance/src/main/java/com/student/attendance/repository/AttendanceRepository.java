package com.student.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.student.attendance.model.Attendance;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    Optional<Attendance> findByStudentUsnAndDate(String studentUsn, LocalDate date);

    List<Attendance> findByStudentUsnOrderByDateDesc(String studentUsn);

}
