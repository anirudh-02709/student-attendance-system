package com.student.attendance.exception;

public class InvalidLocationException extends RuntimeException {

    public InvalidLocationException(String message) {
        super(message);
    }
}