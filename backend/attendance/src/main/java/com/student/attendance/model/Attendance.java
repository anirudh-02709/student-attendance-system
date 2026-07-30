package com.student.attendance.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "attendance")
@CompoundIndex(name = "student_date_unique_idx", def = "{'studentUsn': 1, 'date': 1}", unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    private String id;

    private String studentUsn;

    private LocalDate date;

    private LocalDateTime markedAt;

    private AttendanceStatus status;

    private Double latitude;

    private Double longitude;

}
