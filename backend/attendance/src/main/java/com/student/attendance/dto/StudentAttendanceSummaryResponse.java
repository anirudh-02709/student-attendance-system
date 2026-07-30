package com.student.attendance.dto;

import java.util.List;

public record StudentAttendanceSummaryResponse(int presentCount,
                                               int absentCount,
                                               double attendancePercentage,
                                               List<StudentAttendanceRecordResponse> attendanceHistory) {
}
