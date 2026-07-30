package com.student.attendance.auth;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.student.attendance.auth.dto.LoginRequest;
import com.student.attendance.auth.dto.LoginResponse;
import com.student.attendance.model.Faculty;
import com.student.attendance.model.Role;
import com.student.attendance.security.JwtService;
import com.student.attendance.service.FacultyService;

@Service
public class AuthService {

    private final FacultyService facultyService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(FacultyService facultyService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.facultyService = facultyService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Faculty faculty;
        try {
            faculty = facultyService.findByUsername(request.username());
        } catch (UsernameNotFoundException exception) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (faculty.getPassword() == null || !passwordEncoder.matches(request.password(), faculty.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        Role role = normalizeRole(faculty.getRole(), Role.FACULTY);

        UserDetails userDetails = User.withUsername(faculty.getUsername())
                .password(faculty.getPassword())
                .roles(role.name())
                .build();

        return new LoginResponse(jwtService.generateToken(userDetails), userDetails.getUsername(), role);
    }

    private Role normalizeRole(Role role, Role defaultRole) {
        if (role == null) {
            return defaultRole;
        }

        return role;
    }
}
