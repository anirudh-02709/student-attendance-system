package com.student.attendance.service;

import com.student.attendance.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;

public interface AnnouncementService {

    Announcement addAnnouncement(Announcement announcement);

    Announcement updateAnnouncement(String id, Announcement announcement);

    void deleteAnnouncement(String id);

    Page<Announcement> getAnnouncementsByFacultyUsername(String facultyUsername, Pageable pageable);

    Page<Announcement> getActiveAnnouncements(String facultyUsername, LocalDate today, Pageable pageable);

}
