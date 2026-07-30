package com.student.attendance.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.student.attendance.model.AttendanceStatus;

public record AttendanceResponse(String id,
                                 String studentUsn,
                                 LocalDate date,
                                 LocalDateTime markedAt,
                                 AttendanceStatus status) {
}
