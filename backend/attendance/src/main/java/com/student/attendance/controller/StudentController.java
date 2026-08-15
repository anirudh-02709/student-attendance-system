package com.student.attendance.controller;

import com.student.attendance.dto.StudentPageResponse;
import com.student.attendance.dto.StudentProfileResponse;
import com.student.attendance.model.Student;
import com.student.attendance.service.StudentService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // handles HTTP requests
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping // handles HTTP POST requests
    public StudentProfileResponse addStudent(@RequestBody Student student) {
        return toResponse(studentService.addStudent(student));
    }

    @GetMapping // handles HTTP GET requests
    public List<StudentProfileResponse> getAllStudents() {
        return studentService.getAllStudents().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/page")
    public StudentPageResponse getStudentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        page = Math.max(page, 0);
        size = Math.max(1, Math.min(size, 100));
        Page<Student> studentPage = studentService.getAllStudents(PageRequest.of(page, size));
        List<StudentProfileResponse> students = studentPage.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new StudentPageResponse(
                students,
                studentPage.getNumber(),
                studentPage.getSize(),
                studentPage.getTotalElements(),
                studentPage.getTotalPages());
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

    @PostMapping("/{usn}/marks")
    public void addStudentMarks(@PathVariable String usn,
            @RequestBody Map<String, Integer> request) {
        studentService.uploadMarks(SecurityContextHolder.getContext()
                .getAuthentication()
                .getName(), usn, request);
    }

    @PutMapping("/{usn}/marks")
    public void updateStudentMarks(@PathVariable String usn,
            @RequestBody Map<String, Integer> request) {
        studentService.updateMarks(SecurityContextHolder.getContext()
                .getAuthentication().getName(), usn, request);
    }

    @GetMapping("/marks")
    public Map<String, Integer> getStudentMarks() {
        return studentService.getMarks(SecurityContextHolder.getContext()
                .getAuthentication()
                .getName());
    }
}
