package com.student.attendance.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.student.attendance.model.Faculty;
import com.student.attendance.repository.FacultyRepository;

@Service
public class FacultyServiceImpl implements FacultyService, UserDetailsService {

    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyServiceImpl(FacultyRepository facultyRepository, PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Faculty register(Faculty faculty) {
        faculty.setPassword(passwordEncoder.encode(faculty.getPassword()));
        if (faculty.getRole() == null || faculty.getRole().isBlank()) {
            faculty.setRole("FACULTY");
        }
        return facultyRepository.save(faculty);
    }

    @Override
    public Faculty findByUsername(String username) {
        return facultyRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Faculty not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Faculty faculty = findByUsername(username);
        return User.withUsername(faculty.getUsername())
                .password(faculty.getPassword())
                .roles(faculty.getRole())
                .build();
    }
}