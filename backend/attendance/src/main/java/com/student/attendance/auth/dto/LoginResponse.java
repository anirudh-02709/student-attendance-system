package com.student.attendance.auth.dto;

import com.student.attendance.model.Role;

public record LoginResponse(String token, String username, Role role) {
}
