package com.student.attendance.repository;

import com.student.attendance.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;

public interface AnnouncementRepository extends MongoRepository<Announcement, String> {

    Page<Announcement> findByFacultyUsername(
            String facultyUsername,
            Pageable pageable);

    @Query("""
            {
                'facultyUsername': ?0,
                '$or': [
                    { 'expiryDate': null },
                    { 'expiryDate': { '$gte': ?1 } }
                ]
            }
            """)
    Page<Announcement> findActiveAnnouncements(
            String facultyUsername,
            LocalDate today,
            Pageable pageable);
}