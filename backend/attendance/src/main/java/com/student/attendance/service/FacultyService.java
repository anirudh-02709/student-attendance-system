package com.student.attendance.service;

import com.student.attendance.model.Faculty;

public interface FacultyService {

    Faculty register(Faculty faculty);

    Faculty findByUsername(String username);
}