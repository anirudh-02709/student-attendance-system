package com.student.attendance.service;

import com.student.attendance.model.Attendance;

import java.util.List;

public interface AttendanceService {

    Attendance markAttendance(Attendance attendance);

    List<Attendance> getAllAttendance();

    Attendance getAttendanceById(String id);

    Attendance updateAttendance(String id, Attendance attendance);

    void deleteAttendance(String id);
}