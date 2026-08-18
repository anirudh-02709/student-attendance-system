package com.student.attendance.model;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "announcements")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Announcement {
    @Id
    private String id;
    private String title;
    private String description;
    private LocalDate creationDate;
    private LocalDate expiryDate;
    private String facultyUsername;
}