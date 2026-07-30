package com.student.attendance.service;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.student.attendance.model.Faculty;
import com.student.attendance.model.Role;
import com.student.attendance.repository.FacultyRepository;

@Service
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyServiceImpl(FacultyRepository facultyRepository, PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Faculty register(Faculty faculty) {
        faculty.setPassword(passwordEncoder.encode(faculty.getPassword()));
        if (faculty.getRole() == null) {
            faculty.setRole(Role.FACULTY);
        }
        return facultyRepository.save(faculty);
    }

    @Override
    public Faculty findByUsername(String username) {
        return facultyRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Faculty not found"));
    }
}
