package com.student.attendance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.student.attendance.model.Faculty;
import com.student.attendance.model.Role;
import com.student.attendance.repository.FacultyRepository;
import com.student.attendance.service.FacultyService;

@Configuration
public class FacultyDataInitializer {

    @Bean
    public CommandLineRunner seedInitialFaculty(FacultyRepository facultyRepository,
                                                FacultyService facultyService,
                                                @Value("${app.faculty.initial-username}") String username,
                                                @Value("${app.faculty.initial-password}") String password) {
        return args -> {
            if (facultyRepository.count() == 0) {
                if (password == null || password.isBlank()) {
                    throw new IllegalStateException(
                            "Cannot seed initial faculty account: INITIAL_FACULTY_PASSWORD is required and must not be blank.");
                }
                facultyService.register(new Faculty(null, "System Administrator", username, password, Role.FACULTY));
            }
        };
    }
}
