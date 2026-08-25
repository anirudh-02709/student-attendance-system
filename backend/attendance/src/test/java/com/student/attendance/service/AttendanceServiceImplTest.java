package com.student.attendance.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.student.attendance.dto.AttendanceLocationRequest;
import com.student.attendance.exception.DuplicateAttendanceException;
import com.student.attendance.exception.HolidayAttendanceException;
import com.student.attendance.exception.InvalidLocationException;
import com.student.attendance.model.Attendance;
import com.student.attendance.model.AttendanceStatus;
import com.student.attendance.model.Holiday;
import com.student.attendance.model.Student;
import com.student.attendance.repository.AttendanceRepository;
import com.student.attendance.repository.HolidayRepository;
import com.student.attendance.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceImplTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private HolidayRepository holidayRepository;

    private AttendanceServiceImpl attendanceService;

    // College coordinates from AttendanceServiceImpl
    private static final double COLLEGE_LAT = 12.892763130939501;
    private static final double COLLEGE_LON = 77.60511508379179;

    @BeforeEach
    void setUp() {
        attendanceService = new AttendanceServiceImpl(attendanceRepository, studentRepository, holidayRepository);
        SecurityContextHolder.clearContext();
    }

    private void authenticateStudent(String usn) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        usn,
                        null,
                        AuthorityUtils.createAuthorityList("ROLE_STUDENT"));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void authenticateFaculty(String username) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        AuthorityUtils.createAuthorityList("ROLE_FACULTY"));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void studentSelfMarking_rejected_whenDateIsHoliday() {
        authenticateStudent("1AH22CS001");

        LocalDate today = LocalDate.now();
        Holiday holiday = new Holiday("h1", "National Independence Day", today, "Holiday", today);
        when(holidayRepository.findByDate(today)).thenReturn(Optional.of(holiday));

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setLatitude(COLLEGE_LAT);
        request.setLongitude(COLLEGE_LON);

        HolidayAttendanceException exception = assertThrows(
                HolidayAttendanceException.class,
                () -> attendanceService.markAttendance("1AH22CS001", request, true)
        );

        assertTrue(exception.getMessage().contains("National Independence Day"));
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void studentSelfMarking_ignoresCustomDateInRequest_andAlwaysUsesCurrentDate() {
        authenticateStudent("1AH22CS001");

        LocalDate today = LocalDate.now();
        LocalDate forgedDate = LocalDate.of(2025, 1, 1);

        when(holidayRepository.findByDate(today)).thenReturn(Optional.empty());
        when(attendanceRepository.findByStudentUsnAndDate("1AH22CS001", today)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> {
            Attendance a = invocation.getArgument(0);
            a.setId("att-101");
            return a;
        });

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setDate(forgedDate); // Student tries to pass arbitrary date
        request.setLatitude(COLLEGE_LAT);
        request.setLongitude(COLLEGE_LON);

        Attendance result = attendanceService.markAttendance("1AH22CS001", request, true);

        assertNotNull(result);
        assertEquals(today, result.getDate(), "Student attendance date must be locked to LocalDate.now()");
        assertNotEquals(forgedDate, result.getDate());
        verify(holidayRepository).findByDate(today);
        verify(holidayRepository, never()).findByDate(forgedDate);
    }

    @Test
    void studentSelfMarking_rejectedIfTodayIsHoliday_evenIfRequestContainsNonHolidayDate() {
        authenticateStudent("1AH22CS001");

        LocalDate today = LocalDate.now();
        LocalDate arbitraryDate = LocalDate.of(2099, 5, 20);

        Holiday holiday = new Holiday("h1", "College Foundation Day", today, "Holiday", today);
        when(holidayRepository.findByDate(today)).thenReturn(Optional.of(holiday));

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setDate(arbitraryDate);
        request.setLatitude(COLLEGE_LAT);
        request.setLongitude(COLLEGE_LON);

        HolidayAttendanceException exception = assertThrows(
                HolidayAttendanceException.class,
                () -> attendanceService.markAttendance("1AH22CS001", request, true)
        );

        assertTrue(exception.getMessage().contains("College Foundation Day"));
        verify(holidayRepository).findByDate(today);
        verify(holidayRepository, never()).findByDate(arbitraryDate);
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void facultyManualMarking_rejected_whenSelectedDateIsHoliday() {
        authenticateFaculty("faculty01");

        LocalDate holidayDate = LocalDate.of(2026, 10, 2);
        Holiday holiday = new Holiday("h2", "Gandhi Jayanti", holidayDate, "National Holiday", LocalDate.now());
        when(holidayRepository.findByDate(holidayDate)).thenReturn(Optional.of(holiday));

        Student student = new Student();
        student.setUsn("1AH22CS001");
        student.setFacultyUsername("faculty01");
        when(studentRepository.findByUsnAndFacultyUsername("1AH22CS001", "faculty01")).thenReturn(Optional.of(student));

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setStudentUsn("1AH22CS001");
        request.setDate(holidayDate);
        request.setStatus(AttendanceStatus.Present);

        HolidayAttendanceException exception = assertThrows(
                HolidayAttendanceException.class,
                () -> attendanceService.markAttendance("1AH22CS001", request, false)
        );

        assertTrue(exception.getMessage().contains("Gandhi Jayanti"));
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void studentSelfMarking_succeeds_onNonHolidayDate() {
        authenticateStudent("1AH22CS001");

        LocalDate today = LocalDate.now();
        when(holidayRepository.findByDate(today)).thenReturn(Optional.empty());
        when(attendanceRepository.findByStudentUsnAndDate("1AH22CS001", today)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> {
            Attendance a = invocation.getArgument(0);
            a.setId("att-101");
            return a;
        });

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setLatitude(COLLEGE_LAT);
        request.setLongitude(COLLEGE_LON);

        Attendance result = attendanceService.markAttendance("1AH22CS001", request, true);

        assertNotNull(result);
        assertEquals("att-101", result.getId());
        assertEquals("1AH22CS001", result.getStudentUsn());
        assertEquals(today, result.getDate());
        assertEquals(AttendanceStatus.Present, result.getStatus());
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void facultyManualMarking_succeeds_onNonHolidayDate_withSelectedDate() {
        authenticateFaculty("faculty01");

        LocalDate regularDate = LocalDate.of(2026, 9, 15);
        when(holidayRepository.findByDate(regularDate)).thenReturn(Optional.empty());

        Student student = new Student();
        student.setUsn("1AH22CS001");
        student.setFacultyUsername("faculty01");
        when(studentRepository.findByUsnAndFacultyUsername("1AH22CS001", "faculty01")).thenReturn(Optional.of(student));
        when(attendanceRepository.findByStudentUsnAndDate("1AH22CS001", regularDate)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> {
            Attendance a = invocation.getArgument(0);
            a.setId("att-102");
            return a;
        });

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setStudentUsn("1AH22CS001");
        request.setDate(regularDate);
        request.setStatus(AttendanceStatus.Present);

        Attendance result = attendanceService.markAttendance("1AH22CS001", request, false);

        assertNotNull(result);
        assertEquals("att-102", result.getId());
        assertEquals(regularDate, result.getDate());
        verify(holidayRepository).findByDate(regularDate);
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void markAttendance_throwsDuplicateException_whenAlreadyMarkedOnNonHoliday() {
        authenticateStudent("1AH22CS001");

        LocalDate today = LocalDate.now();
        when(holidayRepository.findByDate(today)).thenReturn(Optional.empty());
        when(attendanceRepository.findByStudentUsnAndDate("1AH22CS001", today))
                .thenReturn(Optional.of(new Attendance()));

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setLatitude(COLLEGE_LAT);
        request.setLongitude(COLLEGE_LON);

        assertThrows(
                DuplicateAttendanceException.class,
                () -> attendanceService.markAttendance("1AH22CS001", request, true)
        );
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void markAttendance_throwsInvalidLocationException_whenOutsideCampusOnNonHoliday() {
        authenticateStudent("1AH22CS001");

        LocalDate today = LocalDate.now();
        when(holidayRepository.findByDate(today)).thenReturn(Optional.empty());
        when(attendanceRepository.findByStudentUsnAndDate("1AH22CS001", today)).thenReturn(Optional.empty());

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        // Location far outside campus (e.g. latitude + 1.0 degree)
        request.setLatitude(COLLEGE_LAT + 1.0);
        request.setLongitude(COLLEGE_LON);

        assertThrows(
                InvalidLocationException.class,
                () -> attendanceService.markAttendance("1AH22CS001", request, true)
        );
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void studentSelfMarking_throwsForbidden_whenMarkingForAnotherStudent() {
        authenticateStudent("1AH22CS001");

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setLatitude(COLLEGE_LAT);
        request.setLongitude(COLLEGE_LON);

        assertThrows(
                ResponseStatusException.class,
                () -> attendanceService.markAttendance("1AH22CS002", request, true)
        );
        verify(holidayRepository, never()).findByDate(any());
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void facultyManualMarking_throwsForbidden_whenStudentNotOwnedByFaculty() {
        authenticateFaculty("faculty01");

        when(studentRepository.findByUsnAndFacultyUsername("1AH22CS999", "faculty01")).thenReturn(Optional.empty());

        AttendanceLocationRequest request = new AttendanceLocationRequest();
        request.setStudentUsn("1AH22CS999");
        request.setDate(LocalDate.of(2026, 9, 15));

        assertThrows(
                ResponseStatusException.class,
                () -> attendanceService.markAttendance("1AH22CS999", request, false)
        );
        verify(holidayRepository, never()).findByDate(any());
        verify(attendanceRepository, never()).save(any());
    }
}
