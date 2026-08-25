package com.student.attendance.dto;

import java.time.LocalDate;

public record HolidayResponse(
        String id,
        String name,
        LocalDate date,
        String description,
        LocalDate createdAt
) {
}
