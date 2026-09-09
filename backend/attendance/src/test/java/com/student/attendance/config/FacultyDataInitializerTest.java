package com.student.attendance.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;

import com.student.attendance.model.Faculty;
import com.student.attendance.model.Role;
import com.student.attendance.repository.FacultyRepository;
import com.student.attendance.service.FacultyService;

@ExtendWith(MockitoExtension.class)
class FacultyDataInitializerTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FacultyService facultyService;

    private FacultyDataInitializer initializer;

    @BeforeEach
    void setUp() {
        initializer = new FacultyDataInitializer();
    }

    @Test
    void seedInitialFaculty_registersAdmin_whenRepositoryIsEmptyAndValidPasswordSupplied() throws Exception {
        when(facultyRepository.count()).thenReturn(0L);

        CommandLineRunner runner = initializer.seedInitialFaculty(facultyRepository, facultyService, "admin", "securePass123");
        runner.run();

        ArgumentCaptor<Faculty> captor = ArgumentCaptor.forClass(Faculty.class);
        verify(facultyService).register(captor.capture());

        Faculty created = captor.getValue();
        assertEquals("System Administrator", created.getName());
        assertEquals("admin", created.getUsername());
        assertEquals("securePass123", created.getPassword());
        assertEquals(Role.FACULTY, created.getRole());
    }

    @Test
    void seedInitialFaculty_doesNothing_whenFacultyAlreadyExists() throws Exception {
        when(facultyRepository.count()).thenReturn(1L);

        CommandLineRunner runner = initializer.seedInitialFaculty(facultyRepository, facultyService, "admin", "securePass123");
        runner.run();

        verify(facultyService, never()).register(any());
    }

    @Test
    void seedInitialFaculty_throwsIllegalStateException_whenPasswordIsNull() {
        when(facultyRepository.count()).thenReturn(0L);

        CommandLineRunner runner = initializer.seedInitialFaculty(facultyRepository, facultyService, "admin", null);

        assertThrows(IllegalStateException.class, () -> runner.run());
        verify(facultyService, never()).register(any());
    }

    @Test
    void seedInitialFaculty_throwsIllegalStateException_whenPasswordIsBlank() {
        when(facultyRepository.count()).thenReturn(0L);

        CommandLineRunner runner = initializer.seedInitialFaculty(facultyRepository, facultyService, "admin", "   ");

        assertThrows(IllegalStateException.class, () -> runner.run());
        verify(facultyService, never()).register(any());
    }
}
