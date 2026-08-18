package com.student.attendance.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.student.attendance.model.Announcement;
import com.student.attendance.model.Student;
import com.student.attendance.repository.StudentRepository;
import com.student.attendance.service.AnnouncementService;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final StudentRepository studentRepository;

    public AnnouncementController(
            AnnouncementService announcementService,
            StudentRepository studentRepository) {

        this.announcementService = announcementService;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    public ResponseEntity<Announcement> addAnnouncement(
            @RequestBody Announcement announcement) {

        Announcement createdAnnouncement = announcementService.addAnnouncement(announcement);

        return ResponseEntity.ok(createdAnnouncement);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(
            @PathVariable String id,
            @RequestBody Announcement announcement) {

        Announcement updatedAnnouncement = announcementService.updateAnnouncement(id, announcement);

        return ResponseEntity.ok(updatedAnnouncement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable String id) {

        announcementService.deleteAnnouncement(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Announcement>> getAnnouncements(
            Authentication authentication,
            Pageable pageable) {

        String facultyUsername = authentication.getName();

        Page<Announcement> announcements = announcementService.getAnnouncementsByFacultyUsername(
                facultyUsername,
                pageable);

        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/student")
    public ResponseEntity<Page<Announcement>> getAnnouncementStudents(
            Authentication authentication,
            Pageable pageable) {

        String usn = authentication.getName();

        Student student = studentRepository.findByUsn(usn)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String facultyUsername = student.getFacultyUsername();

        Page<Announcement> announcements = announcementService.getActiveAnnouncements(
                facultyUsername,
                LocalDate.now(),
                pageable);

        return ResponseEntity.ok(announcements);
    }
}