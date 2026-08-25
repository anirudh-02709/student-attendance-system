package com.student.attendance.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.student.attendance.dto.HolidayRequest;
import com.student.attendance.dto.HolidayResponse;
import com.student.attendance.exception.DuplicateHolidayException;
import com.student.attendance.exception.HolidayNotFoundException;
import com.student.attendance.model.Holiday;
import com.student.attendance.repository.HolidayRepository;

@Service
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayServiceImpl(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    @Override
    public HolidayResponse addHoliday(HolidayRequest request) {
        if (holidayRepository.existsByDate(request.getDate())) {
            throw new DuplicateHolidayException("A holiday is already scheduled for date: " + request.getDate());
        }

        Holiday holiday = new Holiday();
        holiday.setName(request.getName().trim());
        holiday.setDate(request.getDate());
        holiday.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        holiday.setCreatedAt(LocalDate.now());

        try {
            Holiday saved = holidayRepository.save(holiday);
            return toResponse(saved);
        } catch (DuplicateKeyException exception) {
            throw new DuplicateHolidayException("A holiday is already scheduled for date: " + request.getDate());
        }
    }

    @Override
    public List<HolidayResponse> getAllHolidays() {
        return holidayRepository.findAllByOrderByDateAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Page<HolidayResponse> getHolidays(Pageable pageable) {
        return holidayRepository.findAllByOrderByDateAsc(pageable)
                .map(this::toResponse);
    }

    @Override
    public HolidayResponse getHolidayById(String id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new HolidayNotFoundException("Holiday not found with id: " + id));
        return toResponse(holiday);
    }

    @Override
    public HolidayResponse updateHoliday(String id, HolidayRequest request) {
        Holiday existing = holidayRepository.findById(id)
                .orElseThrow(() -> new HolidayNotFoundException("Holiday not found with id: " + id));

        if (!existing.getDate().equals(request.getDate())) {
            Optional<Holiday> conflict = holidayRepository.findByDate(request.getDate());
            if (conflict.isPresent() && !conflict.get().getId().equals(id)) {
                throw new DuplicateHolidayException("A holiday is already scheduled for date: " + request.getDate());
            }
        }

        existing.setName(request.getName().trim());
        existing.setDate(request.getDate());
        existing.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        try {
            Holiday updated = holidayRepository.save(existing);
            return toResponse(updated);
        } catch (DuplicateKeyException exception) {
            throw new DuplicateHolidayException("A holiday is already scheduled for date: " + request.getDate());
        }
    }

    @Override
    public void deleteHoliday(String id) {
        Holiday existing = holidayRepository.findById(id)
                .orElseThrow(() -> new HolidayNotFoundException("Holiday not found with id: " + id));
        holidayRepository.delete(existing);
    }

    private HolidayResponse toResponse(Holiday holiday) {
        return new HolidayResponse(
                holiday.getId(),
                holiday.getName(),
                holiday.getDate(),
                holiday.getDescription(),
                holiday.getCreatedAt()
        );
    }
}
