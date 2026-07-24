package com.student.attendance.service;

import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service; //@Service annotation

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentByUsn(String usn) {
        return studentRepository.findById(usn).orElse(null);
    }

    @Override
    public Student updateStudent(String usn, Student updatedStudent) {

        Student existingStudent = studentRepository.findById(usn).orElse(null);

        if (existingStudent != null) {
            existingStudent.setName(updatedStudent.getName());
            existingStudent.setBranch(updatedStudent.getBranch());
            existingStudent.setYear(updatedStudent.getYear());

            return studentRepository.save(existingStudent);
        }

        return null;
    }

    @Override
    public void deleteStudent(String usn) {

        Student student = studentRepository.findById(usn).orElse(null);

        if (student != null) {
            studentRepository.delete(student);
        }
    }
}