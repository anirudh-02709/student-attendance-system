package com.student.attendance.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.student.attendance.auth.StudentAuthService;
import com.student.attendance.auth.dto.LoginResponse;
import com.student.attendance.auth.dto.StudentLoginRequest;
import com.student.attendance.dto.StudentAttendanceSummaryResponse;
import com.student.attendance.dto.StudentProfileResponse;
import com.student.attendance.service.StudentDashboardService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/student")
public class StudentAuthController {

    private final StudentAuthService studentAuthService;
    private final StudentDashboardService studentDashboardService;

    public StudentAuthController(StudentAuthService studentAuthService,
                                  StudentDashboardService studentDashboardService) {
        this.studentAuthService = studentAuthService;
        this.studentDashboardService = studentDashboardService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody StudentLoginRequest request) {
        try {
            return ResponseEntity.ok(studentAuthService.login(request));
        } catch (BadCredentialsException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/me")
    public StudentProfileResponse getCurrentStudent(Authentication authentication) {
        return studentDashboardService.getProfile(authentication.getName());
    }

    @GetMapping("/me/attendance")
    public StudentAttendanceSummaryResponse getCurrentStudentAttendance(Authentication authentication) {
        return studentDashboardService.getAttendanceSummary(authentication.getName());
    }
}
