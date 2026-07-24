package com.student.attendance.service;

import com.student.attendance.model.Attendance;
import com.student.attendance.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public Attendance markAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Attendance getAttendanceById(String id) {
        return attendanceRepository.findById(id).orElse(null);
    }

    @Override
    public Attendance updateAttendance(String id, Attendance updatedAttendance) {

        Attendance existingAttendance = attendanceRepository.findById(id).orElse(null);

        if (existingAttendance != null) {

            existingAttendance.setStudentUsn(updatedAttendance.getStudentUsn());
            existingAttendance.setDate(updatedAttendance.getDate());
            existingAttendance.setMarkedAt(updatedAttendance.getMarkedAt());
            existingAttendance.setStatus(updatedAttendance.getStatus());

            return attendanceRepository.save(existingAttendance);
        }

        return null;
    }

    @Override
    public void deleteAttendance(String id) {

        Attendance attendance = attendanceRepository.findById(id).orElse(null);

        if (attendance != null) {
            attendanceRepository.delete(attendance);
        }
    }
}