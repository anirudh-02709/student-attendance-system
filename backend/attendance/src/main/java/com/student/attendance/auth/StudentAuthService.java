package com.student.attendance.auth;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.student.attendance.auth.dto.LoginResponse;
import com.student.attendance.auth.dto.StudentLoginRequest;
import com.student.attendance.model.Role;
import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;
import com.student.attendance.security.JwtService;

@Service
public class StudentAuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public StudentAuthService(StudentRepository studentRepository,
                              PasswordEncoder passwordEncoder,
                              JwtService jwtService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(StudentLoginRequest request) {
        Student student = studentRepository.findById(request.usn())
                .orElseThrow(() -> new BadCredentialsException("Invalid USN or password"));

        if (student.getPassword() == null || !passwordEncoder.matches(request.password(), student.getPassword())) {
            throw new BadCredentialsException("Invalid USN or password");
        }

        Role role = normalizeRole(student.getRole(), Role.STUDENT);

        UserDetails userDetails = User.withUsername(student.getUsn())
                .password(student.getPassword())
                .roles(role.name())
                .build();

        return new LoginResponse(jwtService.generateToken(userDetails), student.getUsn(), role);
    }

    private Role normalizeRole(Role role, Role defaultRole) {
        if (role == null) {
            return defaultRole;
        }

        return role;
    }
}
