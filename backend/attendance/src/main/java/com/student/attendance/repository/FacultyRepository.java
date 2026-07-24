package com.student.attendance.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.student.attendance.model.Faculty;

@Repository
public interface FacultyRepository extends MongoRepository<Faculty, String> {

    Optional<Faculty> findByUsername(String username);
}