package com.student.attendance.service;

import java.util.List;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.student.attendance.dto.StudentAttendanceRecordResponse;
import com.student.attendance.dto.StudentAttendanceSummaryResponse;
import com.student.attendance.dto.StudentProfileResponse;
import com.student.attendance.model.Attendance;
import com.student.attendance.model.AttendanceStatus;
import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;

@Service
public class StudentDashboardService {

    private final StudentRepository studentRepository;
    private final AttendanceService attendanceService;

    public StudentDashboardService(StudentRepository studentRepository,
                                   AttendanceService attendanceService) {
        this.studentRepository = studentRepository;
        this.attendanceService = attendanceService;
    }

    public StudentProfileResponse getProfile(String usn) {
        Student student = studentRepository.findById(usn)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        return new StudentProfileResponse(
                student.getUsn(),
                student.getName(),
                student.getBranch(),
                student.getYear()
        );
    }

    public StudentAttendanceSummaryResponse getAttendanceSummary(String usn) {

        Student student = studentRepository.findById(usn)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        // No faculty ownership check is required here.
        // This service is accessed by the authenticated student,
        // who can only request their own dashboard.

        List<Attendance> attendanceRecords = attendanceService.getAttendanceByStudentUsn(usn);

        int presentCount = (int) attendanceRecords.stream()
                .filter(attendance -> attendance.getStatus() == AttendanceStatus.Present)
                .count();

        int absentCount = (int) attendanceRecords.stream()
                .filter(attendance -> attendance.getStatus() == AttendanceStatus.Absent)
                .count();

        int totalCount = presentCount + absentCount;

        double attendancePercentage = totalCount > 0
                ? Math.round((presentCount * 10000.0) / totalCount) / 100.0
                : 0;

        List<StudentAttendanceRecordResponse> attendanceHistory = attendanceRecords.stream()
                .map(attendance -> new StudentAttendanceRecordResponse(
                        attendance.getDate(),
                        attendance.getStatus()
                ))
                .toList();

        return new StudentAttendanceSummaryResponse(
                presentCount,
                absentCount,
                attendancePercentage,
                attendanceHistory
        );
    }
}