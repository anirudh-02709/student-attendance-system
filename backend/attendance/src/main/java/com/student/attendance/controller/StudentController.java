package com.student.attendance.controller;

import com.student.attendance.dto.StudentProfileResponse;
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
    public StudentProfileResponse addStudent(@RequestBody Student student) {
        return toResponse(studentService.addStudent(student));
    }

    @GetMapping //handles HTTP GET requests
    public List<StudentProfileResponse> getAllStudents() {
        return studentService.getAllStudents().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{usn}")
    public StudentProfileResponse getStudentByUsn(@PathVariable String usn) {
        return toResponse(studentService.getStudentByUsn(usn));
    }

    @PutMapping("/{usn}")
    public StudentProfileResponse updateStudent(@PathVariable String usn,
                                 @RequestBody Student student) {
        return toResponse(studentService.updateStudent(usn, student));
    }

    @DeleteMapping("/{usn}")
    public void deleteStudent(@PathVariable String usn) {
        studentService.deleteStudent(usn);
    }

    private StudentProfileResponse toResponse(Student student) {
        return new StudentProfileResponse(student.getUsn(), student.getName(), student.getBranch(), student.getYear());
    }
}
