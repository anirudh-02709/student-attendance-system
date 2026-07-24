package com.student.attendance.controller;

import com.student.attendance.model.Student;
import com.student.attendance.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //handles HTTP requests
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping //handles HTTP POST requests
    public Student addStudent(@RequestBody Student student) {
        return studentService.addStudent(student);
    }

    @GetMapping //handles HTTP GET requests
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{usn}")
    public Student getStudentByUsn(@PathVariable String usn) {
        return studentService.getStudentByUsn(usn);
    }

    @PutMapping("/{usn}")
    public Student updateStudent(@PathVariable String usn,
                                 @RequestBody Student student) {
        return studentService.updateStudent(usn, student);
    }

    @DeleteMapping("/{usn}")
    public void deleteStudent(@PathVariable String usn) {
        studentService.deleteStudent(usn);
    }
}