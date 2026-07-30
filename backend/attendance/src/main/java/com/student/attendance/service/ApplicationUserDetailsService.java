package com.student.attendance.service;

import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.student.attendance.model.Faculty;
import com.student.attendance.model.Role;
import com.student.attendance.model.Student;
import com.student.attendance.repository.FacultyRepository;
import com.student.attendance.repository.StudentRepository;

@Primary
@Service
public class ApplicationUserDetailsService implements UserDetailsService {

    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    public ApplicationUserDetailsService(FacultyRepository facultyRepository,
                                         StudentRepository studentRepository) {
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return facultyRepository.findByUsername(username)
                .map(this::buildFacultyUserDetails)
                .or(() -> studentRepository.findById(username).map(this::buildStudentUserDetails))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private UserDetails buildFacultyUserDetails(Faculty faculty) {
        Role role = normalizeRole(faculty.getRole(), Role.FACULTY);

        return User.withUsername(faculty.getUsername())
                .password(faculty.getPassword())
                .roles(role.name())
                .build();
    }

    private UserDetails buildStudentUserDetails(Student student) {
        if (student.getPassword() == null || student.getPassword().isBlank()) {
            throw new UsernameNotFoundException("Student password not configured");
        }

        Role role = normalizeRole(student.getRole(), Role.STUDENT);

        return User.withUsername(student.getUsn())
                .password(student.getPassword())
                .roles(role.name())
                .build();
    }

    private Role normalizeRole(Role role, Role defaultRole) {
        if (role == null) {
            return defaultRole;
        }

        return role;
    }
}
