package com.student.attendance.dto;

import java.util.List;

public record StudentPageResponse(
        List<StudentProfileResponse> students,
        int currentPage,
        int pageSize,
        long totalElements,
        int totalPages) {
}
