package com.student.attendance.service;

import java.util.Map;
import java.util.Set;

import com.student.attendance.exception.StudentNotFoundException;
import com.student.attendance.model.Role;
import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private static final Set<String> VALID_SUBJECTS = Set.of(
            "DBMS",
            "DSA",
            "OS",
            "Java",
            "Computer Networks");

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentServiceImpl(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Student addStudent(Student student) {
        prepareStudentCredentials(student);
        return studentRepository.save(student);
    }

    @Override
    public List<Student> getAllStudents() {
        String facultyUsername = getCurrentFacultyUsername();
        return studentRepository.findByFacultyUsername(facultyUsername);
    }

    @Override
    public Page<Student> getAllStudents(Pageable pageable) {
        String facultyUsername = getCurrentFacultyUsername();
        return studentRepository.findByFacultyUsername(facultyUsername, pageable);
    }

    @Override
    public Student getStudentByUsn(String usn) {
        String facultyUsername = getCurrentFacultyUsername();
        return studentRepository.findByUsnAndFacultyUsername(usn, facultyUsername)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with USN: " + usn));
    }

    @Override
    public Student updateStudent(String usn, Student updatedStudent) {

        String facultyUsername = getCurrentFacultyUsername();
        Student existingStudent = studentRepository.findByUsnAndFacultyUsername(usn, facultyUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You do not have permission to update this student"));

        existingStudent.setName(updatedStudent.getName());
        existingStudent.setBranch(updatedStudent.getBranch());
        existingStudent.setYear(updatedStudent.getYear());

        if (updatedStudent.getPassword() != null && !updatedStudent.getPassword().isBlank()) {
            existingStudent.setPassword(passwordEncoder.encode(updatedStudent.getPassword()));
        }

        existingStudent.setRole(Role.STUDENT);

        return studentRepository.save(existingStudent);
    }

    @Override
    public void deleteStudent(String usn) {

        String facultyUsername = getCurrentFacultyUsername();
        Student student = studentRepository.findByUsnAndFacultyUsername(usn, facultyUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You do not have permission to delete this student"));

        studentRepository.delete(student);
    }

    private void prepareStudentCredentials(Student student) {
        if (student.getPassword() != null && !student.getPassword().isBlank()) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getName() != null && !"anonymousUser".equals(authentication.getName())) {
            student.setFacultyUsername(authentication.getName());
        }

        student.setRole(Role.STUDENT);
    }

    private String getCurrentFacultyUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalStateException("Authenticated faculty username is required to fetch students");
        }

        return authentication.getName();
    }

    public Student uploadMarks(
            String facultyUsername,
            String usn,
            Map<String, Integer> marks) {

        Student student = studentRepository.findByUsnAndFacultyUsername(usn, facultyUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You do not have permission to upload marks for this student"));

        for (Map.Entry<String, Integer> entry : marks.entrySet()) {
            String subject = entry.getKey();
            Integer mark = entry.getValue();

            if (mark == null) {
                continue;
            }

            if (!VALID_SUBJECTS.contains(subject)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid subject: " + subject);
            }

            if (student.getMarks().containsKey(subject)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Marks already uploaded for " + subject);
            }

            student.getMarks().put(subject, mark);
        }

        return studentRepository.save(student);
    }

    public Map<String, Integer> getMarks(String usn) {
        Student student = studentRepository.findByUsn(usn)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"));

        return student.getMarks();
    }

    public Student updateMarks(String facultyUsername, String usn, Map<String, Integer> marks) {
        Student student = studentRepository.findByUsnAndFacultyUsername(usn, facultyUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You do not have permission to update marks for this student"));

        for (Map.Entry<String, Integer> entry : marks.entrySet()) {
            String subject = entry.getKey();
            Integer mark = entry.getValue();

            if (!VALID_SUBJECTS.contains(subject)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid subject: " + subject);
            }

            if (mark == null) {
                continue;
            }

            if (!student.getMarks().containsKey(subject)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Marks not found for " + subject);
            }

            student.getMarks().put(subject, mark);
        }

        return studentRepository.save(student);
    }
}
