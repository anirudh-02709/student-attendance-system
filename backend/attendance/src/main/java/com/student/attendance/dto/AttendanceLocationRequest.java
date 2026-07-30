package com.student.attendance.dto;

import com.student.attendance.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLocationRequest {

    private String studentUsn;
    private Double latitude;
    private Double longitude;
    private LocalDate date;
    private AttendanceStatus status;

}
