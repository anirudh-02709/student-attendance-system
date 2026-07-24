package com.student.attendance.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository; //@Repository annotation

import com.student.attendance.model.Student;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

}