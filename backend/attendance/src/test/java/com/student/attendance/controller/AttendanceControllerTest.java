package com.student.attendance.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.student.attendance.dto.AttendanceLocationRequest;
import com.student.attendance.exception.GlobalExceptionHandler;
import com.student.attendance.model.Attendance;
import com.student.attendance.model.AttendanceStatus;
import com.student.attendance.service.AttendanceService;

@ExtendWith(MockitoExtension.class)
class AttendanceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AttendanceService attendanceService;

    @BeforeEach
    void setUp() {
        AttendanceController controller = new AttendanceController(attendanceService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private UsernamePasswordAuthenticationToken studentPrincipal(String usn) {
        return new UsernamePasswordAuthenticationToken(
                usn,
                null,
                AuthorityUtils.createAuthorityList("ROLE_STUDENT"));
    }

    private UsernamePasswordAuthenticationToken facultyPrincipal(String username) {
        return new UsernamePasswordAuthenticationToken(
                username,
                null,
                AuthorityUtils.createAuthorityList("ROLE_FACULTY"));
    }

    @Test
    void markAttendance_rejected_whenLatitudeIsNull() throws Exception {
        String json = """
                {
                    "longitude": 77.6051
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Latitude is required"));

        verify(attendanceService, never()).markAttendance(any(), any(), anyBoolean());
    }

    @Test
    void markAttendance_rejected_whenLongitudeIsNull() throws Exception {
        String json = """
                {
                    "latitude": 12.8927
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Longitude is required"));

        verify(attendanceService, never()).markAttendance(any(), any(), anyBoolean());
    }

    @Test
    void markAttendance_rejected_whenLatitudeIsBelowNegative90() throws Exception {
        String json = """
                {
                    "latitude": -90.0001,
                    "longitude": 77.6051
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Latitude must be between -90 and 90"));

        verify(attendanceService, never()).markAttendance(any(), any(), anyBoolean());
    }

    @Test
    void markAttendance_rejected_whenLatitudeIsAbove90() throws Exception {
        String json = """
                {
                    "latitude": 90.0001,
                    "longitude": 77.6051
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Latitude must be between -90 and 90"));

        verify(attendanceService, never()).markAttendance(any(), any(), anyBoolean());
    }

    @Test
    void markAttendance_rejected_whenLongitudeIsBelowNegative180() throws Exception {
        String json = """
                {
                    "latitude": 12.8927,
                    "longitude": -180.0001
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Longitude must be between -180 and 180"));

        verify(attendanceService, never()).markAttendance(any(), any(), anyBoolean());
    }

    @Test
    void markAttendance_rejected_whenLongitudeIsAbove180() throws Exception {
        String json = """
                {
                    "latitude": 12.8927,
                    "longitude": 180.0001
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Longitude must be between -180 and 180"));

        verify(attendanceService, never()).markAttendance(any(), any(), anyBoolean());
    }

    @Test
    void markAttendance_succeeds_atBoundaryCoordinates() throws Exception {
        Attendance mockAttendance = new Attendance(
                "att-min",
                "1AH22CS001",
                LocalDate.now(),
                LocalDateTime.now(),
                AttendanceStatus.Present,
                -90.0,
                -180.0);

        when(attendanceService.markAttendance(eq("1AH22CS001"), any(AttendanceLocationRequest.class), eq(true)))
                .thenReturn(mockAttendance);

        String json = """
                {
                    "latitude": -90.0,
                    "longitude": -180.0
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("att-min"))
                .andExpect(jsonPath("$.studentUsn").value("1AH22CS001"));

        verify(attendanceService).markAttendance(eq("1AH22CS001"), any(AttendanceLocationRequest.class), eq(true));
    }

    @Test
    void markAttendance_succeeds_forStudentWithValidCoordinates() throws Exception {
        Attendance mockAttendance = new Attendance(
                "att-1",
                "1AH22CS001",
                LocalDate.now(),
                LocalDateTime.now(),
                AttendanceStatus.Present,
                12.89276,
                77.60511);

        when(attendanceService.markAttendance(eq("1AH22CS001"), any(AttendanceLocationRequest.class), eq(true)))
                .thenReturn(mockAttendance);

        String json = """
                {
                    "latitude": 12.89276,
                    "longitude": 77.60511
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(studentPrincipal("1AH22CS001"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("att-1"))
                .andExpect(jsonPath("$.studentUsn").value("1AH22CS001"))
                .andExpect(jsonPath("$.status").value("Present"));

        verify(attendanceService).markAttendance(eq("1AH22CS001"), any(AttendanceLocationRequest.class), eq(true));
    }

    @Test
    void markAttendance_succeeds_forFacultyWithValidCoordinates() throws Exception {
        Attendance mockAttendance = new Attendance(
                "att-2",
                "1AH22CS001",
                LocalDate.now(),
                LocalDateTime.now(),
                AttendanceStatus.Present,
                12.89276,
                77.60511);

        when(attendanceService.markAttendance(eq("1AH22CS001"), any(AttendanceLocationRequest.class), eq(false)))
                .thenReturn(mockAttendance);

        String json = """
                {
                    "studentUsn": "1AH22CS001",
                    "latitude": 12.89276,
                    "longitude": 77.60511,
                    "status": "Present"
                }
                """;

        mockMvc.perform(post("/attendance")
                .principal(facultyPrincipal("faculty01"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("att-2"))
                .andExpect(jsonPath("$.studentUsn").value("1AH22CS001"));

        verify(attendanceService).markAttendance(eq("1AH22CS001"), any(AttendanceLocationRequest.class), eq(false));
    }
}
