package com.student.attendance.controller;

import com.student.attendance.dto.AttendanceLocationRequest;
import com.student.attendance.dto.AttendanceResponse;
import com.student.attendance.model.Attendance;
import com.student.attendance.model.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.student.attendance.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<?> markAttendance(
            @RequestBody AttendanceLocationRequest request,
            Authentication authentication) {

        boolean isStudent = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + Role.STUDENT.name()));

        String effectiveUsn;
        if (isStudent) {
            effectiveUsn = authentication.getName();
        } else {
            if (request.getStudentUsn() == null || request.getStudentUsn().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Student USN is required."));
            }
            effectiveUsn = request.getStudentUsn();
        }

        return ResponseEntity.ok(toResponse(
                attendanceService.markAttendance(effectiveUsn, request, isStudent)));
    }

    @GetMapping
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceService.getAllAttendance().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public AttendanceResponse getAttendanceById(@PathVariable String id) {
        return toResponse(attendanceService.getAttendanceById(id));
    }

    @PutMapping("/{id}")
    public AttendanceResponse updateAttendance(@PathVariable String id,
            @RequestBody Attendance attendance) {
        return toResponse(attendanceService.updateAttendance(id, attendance));
    }

    @DeleteMapping("/{id}")
    public void deleteAttendance(@PathVariable String id) {
        attendanceService.deleteAttendance(id);
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getStudentUsn(),
                attendance.getDate(),
                attendance.getMarkedAt(),
                attendance.getStatus());
    }
}
