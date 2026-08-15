package com.student.attendance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record StudentLoginRequest(
        @NotBlank(message = "USN is required") String usn,
        @NotBlank(message = "Password is required") String password) {
}
