package com.student.attendance.service;

import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.student.attendance.model.Announcement;
import com.student.attendance.repository.AnnouncementRepository;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementServiceImpl(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Override
    public Announcement addAnnouncement(Announcement announcement) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String facultyUsername = authentication.getName();

        announcement.setFacultyUsername(facultyUsername);
        announcement.setCreationDate(LocalDate.now());

        return announcementRepository.save(announcement);
    }

    @Override
    public Announcement updateAnnouncement(String id, Announcement announcement) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String facultyUsername = authentication.getName();

        Announcement existing = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if (!existing.getFacultyUsername().equals(facultyUsername)) {
            throw new RuntimeException("You are not authorized to update this announcement");
        }

        existing.setTitle(announcement.getTitle());
        existing.setDescription(announcement.getDescription());
        existing.setExpiryDate(announcement.getExpiryDate());

        return announcementRepository.save(existing);
    }

    @Override
    public void deleteAnnouncement(String id) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String facultyUsername = authentication.getName();

        Announcement existing = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if (!existing.getFacultyUsername().equals(facultyUsername)) {
            throw new RuntimeException("You are not authorized to delete this announcement");
        }

        announcementRepository.delete(existing);
    }

    @Override
    public Page<Announcement> getAnnouncementsByFacultyUsername(
            String facultyUsername,
            Pageable pageable) {

        return announcementRepository.findByFacultyUsername(
                facultyUsername,
                pageable);
    }

    @Override
    public Page<Announcement> getActiveAnnouncements(
            String facultyUsername,
            LocalDate today,
            Pageable pageable) {

        return announcementRepository.findActiveAnnouncements(
                facultyUsername,
                today,
                pageable);
    }
}