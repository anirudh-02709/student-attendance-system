package com.student.attendance.service;

import com.student.attendance.model.Student;
import java.util.List;

public interface StudentService {

    Student addStudent(Student student);

    List<Student> getAllStudents();

    Student getStudentByUsn(String usn);

    Student updateStudent(String usn, Student student);

    void deleteStudent(String usn);
}