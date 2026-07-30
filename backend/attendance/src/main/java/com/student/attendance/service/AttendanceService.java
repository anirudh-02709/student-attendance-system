package com.student.attendance.service;

import com.student.attendance.dto.AttendanceLocationRequest;
import com.student.attendance.model.Attendance;

import java.util.List;

public interface AttendanceService {

    Attendance markAttendance(String studentUsn, AttendanceLocationRequest request, boolean requiresLocationVerification);

    List<Attendance> getAllAttendance();

    List<Attendance> getAttendanceByStudentUsn(String studentUsn);

    Attendance getAttendanceById(String id);

    Attendance updateAttendance(String id, Attendance attendance);

    void deleteAttendance(String id);
}
