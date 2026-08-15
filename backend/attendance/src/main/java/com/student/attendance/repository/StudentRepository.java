package com.student.attendance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository; //@Repository annotation

import com.student.attendance.model.Student;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    List<Student> findByFacultyUsername(String facultyUsername);

    Page<Student> findByFacultyUsername(String facultyUsername, Pageable pageable);

    Optional<Student> findByUsnAndFacultyUsername(String usn, String facultyUsername);

    Optional<Student> findByUsn(String usn);
}