package com.student.attendance.service;

import com.student.attendance.dto.AttendanceLocationRequest;
import com.student.attendance.exception.AttendanceNotFoundException;
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
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final HolidayRepository holidayRepository;

    // Replace with your college coordinates
    private static final double COLLEGE_LATITUDE = 12.892763130939501;
    private static final double COLLEGE_LONGITUDE = 77.60511508379179;

    // Allowed radius in meters
    private static final double ALLOWED_RADIUS = 100.0;

    public AttendanceServiceImpl(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            HolidayRepository holidayRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.holidayRepository = holidayRepository;
    }

    @Override
    public Attendance markAttendance(String studentUsn, AttendanceLocationRequest request, boolean requiresLocationVerification) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            boolean isStudent = authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_STUDENT"));

            if (isStudent && !studentUsn.equals(authentication.getName())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You can only mark attendance for your own student record");
            }

            if (!isStudent && !studentBelongsToCurrentFaculty(studentUsn)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You do not have permission to mark attendance for this student");
            }
        }

        LocalDate effectiveDate = requiresLocationVerification
                ? LocalDate.now()
                : (request.getDate() != null ? request.getDate() : LocalDate.now());

        Optional<Holiday> holiday = holidayRepository.findByDate(effectiveDate);
        if (holiday.isPresent()) {
            throw new HolidayAttendanceException(
                    "Cannot mark attendance on holiday: " + holiday.get().getName() + " (" + effectiveDate + ")");
        }

        Attendance attendance = new Attendance();
        attendance.setStudentUsn(studentUsn);
        attendance.setDate(effectiveDate);
        attendance.setMarkedAt(LocalDateTime.now());
        attendance.setStatus(request.getStatus() != null ? request.getStatus() : AttendanceStatus.Present);
        attendance.setLatitude(request.getLatitude());
        attendance.setLongitude(request.getLongitude());

        String duplicateMessage = "Attendance has already been marked for this student on this date.";

        if (attendanceRepository.findByStudentUsnAndDate(
                attendance.getStudentUsn(),
                attendance.getDate()
        ).isPresent()) {
            throw new DuplicateAttendanceException(duplicateMessage);
        }

        if (requiresLocationVerification) {
            verifyLocation(attendance);
        }

        try {
            return attendanceRepository.save(attendance);
        } catch (DuplicateKeyException exception) {
            throw new DuplicateAttendanceException(duplicateMessage);
        }
    }

    private boolean studentBelongsToCurrentFaculty(String studentUsn) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            return false;
        }

        String facultyUsername = authentication.getName();
        return studentRepository.findByUsnAndFacultyUsername(studentUsn, facultyUsername).isPresent();
    }

    private List<String> getCurrentFacultyStudentUsns() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            return List.of();
        }

        String facultyUsername = authentication.getName();
        return studentRepository.findByFacultyUsername(facultyUsername).stream()
                .map(Student::getUsn)
                .toList();
    }

    private void verifyLocation(Attendance attendance) {
        if (attendance.getLatitude() == null || attendance.getLongitude() == null) {
            throw new InvalidLocationException("Location data is missing.");
        }

        double distance = calculateDistance(
                attendance.getLatitude(),
                attendance.getLongitude(),
                COLLEGE_LATITUDE,
                COLLEGE_LONGITUDE
        );

        if (distance > ALLOWED_RADIUS) {
            throw new InvalidLocationException("You are outside the college campus.");
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int earthRadius = 6371000; // meters

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2)
                * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findByStudentUsnInOrderByStudentUsnAsc(getCurrentFacultyStudentUsns());
    }

    @Override
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByStudentUsnInAndDateOrderByStudentUsnAsc(getCurrentFacultyStudentUsns(), date);
    }

    @Override
    public List<Attendance> getAttendanceByStudentUsn(String studentUsn) {
        return attendanceRepository.findByStudentUsnOrderByDateDesc(studentUsn);
    }

    @Override
    public Attendance getAttendanceById(String id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance not found with id: " + id));

        if (!studentBelongsToCurrentFaculty(attendance.getStudentUsn())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to access this attendance record");
        }

        return attendance;
    }

    @Override
    public Attendance updateAttendance(String id, Attendance updatedAttendance) {
        Attendance existingAttendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance not found with id: " + id));

        if (!studentBelongsToCurrentFaculty(existingAttendance.getStudentUsn())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to update this attendance record");
        }

        if (updatedAttendance.getDate() != null) {
            Optional<Holiday> holiday = holidayRepository.findByDate(updatedAttendance.getDate());
            if (holiday.isPresent()) {
                throw new HolidayAttendanceException(
                        "Cannot mark attendance on holiday: " + holiday.get().getName() + " (" + updatedAttendance.getDate() + ")");
            }
        }

        existingAttendance.setStudentUsn(updatedAttendance.getStudentUsn());
        existingAttendance.setDate(updatedAttendance.getDate());
        existingAttendance.setMarkedAt(updatedAttendance.getMarkedAt());
        existingAttendance.setStatus(updatedAttendance.getStatus());
        existingAttendance.setLatitude(updatedAttendance.getLatitude());
        existingAttendance.setLongitude(updatedAttendance.getLongitude());

        return attendanceRepository.save(existingAttendance);
    }

    @Override
    public void deleteAttendance(String id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance not found with id: " + id));

        if (!studentBelongsToCurrentFaculty(attendance.getStudentUsn())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to delete this attendance record");
        }

        attendanceRepository.delete(attendance);
    }
}
