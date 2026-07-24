package com.student.attendance.auth.dto;

public record LoginResponse(String token, String username, String role) {
}