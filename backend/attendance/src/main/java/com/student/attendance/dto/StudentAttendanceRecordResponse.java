package com.student.attendance.dto;

import java.time.LocalDate;

import com.student.attendance.model.AttendanceStatus;

public record StudentAttendanceRecordResponse(LocalDate date, AttendanceStatus status) {
}
