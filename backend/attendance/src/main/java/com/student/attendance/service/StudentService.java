package com.student.attendance.service;

import com.student.attendance.model.Student;
import java.util.List;
import java.util.Map;

public interface StudentService {

    Student addStudent(Student student);

    List<Student> getAllStudents();

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