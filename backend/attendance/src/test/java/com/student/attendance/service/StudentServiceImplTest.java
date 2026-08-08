package com.student.attendance.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.student.attendance.model.Role;
import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private StudentServiceImpl studentService;

    @BeforeEach
    void setUp() {
        studentService = new StudentServiceImpl(studentRepository, passwordEncoder);
        SecurityContextHolder.clearContext();
    }

    @Test
    void addStudent_setsFacultyUsernameFromAuthenticatedUser() {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        "faculty01",
                        null,
                        AuthorityUtils.createAuthorityList("ROLE_FACULTY"));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Student student = new Student();
        student.setUsn("USN123");
        student.setName("Alice");
        student.setBranch("CSE");
        student.setYear(2);
        student.setPassword("secret");

        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Student saved = studentService.addStudent(student);

        assertEquals("faculty01", saved.getFacultyUsername());
        assertEquals("encoded-secret", saved.getPassword());
        assertEquals(Role.STUDENT, saved.getRole());
    }
}
