package com.student.attendance.service;

import com.student.attendance.exception.StudentNotFoundException;
import com.student.attendance.model.Role;
import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service; //@Service annotation

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

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
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentByUsn(String usn) {
        return studentRepository.findById(usn)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with USN: " + usn));
    }

    @Override
    public Student updateStudent(String usn, Student updatedStudent) {

        Student existingStudent = studentRepository.findById(usn)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with USN: " + usn));

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

        Student student = studentRepository.findById(usn)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with USN: " + usn));

        studentRepository.delete(student);
    }

    private void prepareStudentCredentials(Student student) {
        if (student.getPassword() != null && !student.getPassword().isBlank()) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }

        student.setRole(Role.STUDENT);
    }
}
