package com.student.attendance.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.student.attendance.model.Attendance;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

}