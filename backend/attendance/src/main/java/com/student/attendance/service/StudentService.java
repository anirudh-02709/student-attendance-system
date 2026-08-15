package com.student.attendance.service;

import com.student.attendance.model.Student;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface StudentService {

    Student addStudent(Student student);

    List<Student> getAllStudents();

    Page<Student> getAllStudents(Pageable pageable);

    Student getStudentByUsn(String usn);

    Student updateStudent(String usn, Student student);

    void deleteStudent(String usn);

    public Student uploadMarks(
            String facultyUsername,
            String usn,
            Map<String, Integer> marks);

    Student updateMarks(String facultyUsername, String usn, Map<String, Integer> marks);

    Map<String, Integer> getMarks(String usn);
}