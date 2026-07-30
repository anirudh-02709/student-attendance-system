package com.student.attendance.exception;

public class AttendanceNotFoundException extends RuntimeException {

    public AttendanceNotFoundException(String message) {
        super(message);
    }
}
