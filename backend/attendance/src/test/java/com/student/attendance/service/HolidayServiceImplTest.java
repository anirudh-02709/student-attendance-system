package com.student.attendance.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.student.attendance.dto.HolidayRequest;
import com.student.attendance.dto.HolidayResponse;
import com.student.attendance.exception.DuplicateHolidayException;
import com.student.attendance.exception.HolidayNotFoundException;
import com.student.attendance.model.Holiday;
import com.student.attendance.repository.HolidayRepository;

@ExtendWith(MockitoExtension.class)
class HolidayServiceImplTest {

    @Mock
    private HolidayRepository holidayRepository;

    private HolidayServiceImpl holidayService;

    @BeforeEach
    void setUp() {
        holidayService = new HolidayServiceImpl(holidayRepository);
    }

    @Test
    void addHoliday_successfulCreation() {
        LocalDate holidayDate = LocalDate.of(2026, 9, 5);
        HolidayRequest request = new HolidayRequest("Teachers Day", holidayDate, "System-wide holiday");

        when(holidayRepository.existsByDate(holidayDate)).thenReturn(false);
        when(holidayRepository.save(any(Holiday.class))).thenAnswer(invocation -> {
            Holiday h = invocation.getArgument(0);
            h.setId("holiday-123");
            return h;
        });

        HolidayResponse response = holidayService.addHoliday(request);

        assertNotNull(response);
        assertEquals("holiday-123", response.id());
        assertEquals("Teachers Day", response.name());
        assertEquals(holidayDate, response.date());
        assertEquals("System-wide holiday", response.description());
        assertNotNull(response.createdAt());
    }

    @Test
    void addHoliday_throwsDuplicateHolidayException_whenDateAlreadyExists() {
        LocalDate holidayDate = LocalDate.of(2026, 9, 5);
        HolidayRequest request = new HolidayRequest("Teachers Day", holidayDate, "Celebration");

        when(holidayRepository.existsByDate(holidayDate)).thenReturn(true);

        assertThrows(DuplicateHolidayException.class, () -> holidayService.addHoliday(request));
        verify(holidayRepository, never()).save(any());
    }

    @Test
    void getAllHolidays_returnsAllGlobalHolidaysSortedByDateAsc() {
        Holiday h1 = new Holiday("h1", "Gandhi Jayanti", LocalDate.of(2026, 10, 2), "National Holiday", LocalDate.now());
        Holiday h2 = new Holiday("h2", "Diwali", LocalDate.of(2026, 10, 31), "Festival", LocalDate.now());

        when(holidayRepository.findAllByOrderByDateAsc()).thenReturn(List.of(h1, h2));

        List<HolidayResponse> results = holidayService.getAllHolidays();

        assertEquals(2, results.size());
        assertEquals("Gandhi Jayanti", results.get(0).name());
        assertEquals("Diwali", results.get(1).name());
    }

    @Test
    void getHolidayById_successful() {
        Holiday h1 = new Holiday("h1", "Gandhi Jayanti", LocalDate.of(2026, 10, 2), "National Holiday", LocalDate.now());
        when(holidayRepository.findById("h1")).thenReturn(Optional.of(h1));

        HolidayResponse result = holidayService.getHolidayById("h1");

        assertNotNull(result);
        assertEquals("h1", result.id());
        assertEquals("Gandhi Jayanti", result.name());
    }

    @Test
    void updateHoliday_successful() {
        Holiday existing = new Holiday("h1", "Old Name", LocalDate.of(2026, 10, 2), "Old Desc", LocalDate.now());
        when(holidayRepository.findById("h1")).thenReturn(Optional.of(existing));
        when(holidayRepository.save(any(Holiday.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HolidayRequest updateRequest = new HolidayRequest("New Name", LocalDate.of(2026, 10, 2), "New Desc");
        HolidayResponse response = holidayService.updateHoliday("h1", updateRequest);

        assertEquals("New Name", response.name());
        assertEquals("New Desc", response.description());
    }

    @Test
    void updateHoliday_throwsDuplicateHolidayException_whenNewDateConflictsWithAnotherHoliday() {
        Holiday existing = new Holiday("h1", "Holiday 1", LocalDate.of(2026, 10, 2), "Desc 1", LocalDate.now());
        Holiday other = new Holiday("h2", "Holiday 2", LocalDate.of(2026, 10, 3), "Desc 2", LocalDate.now());

        when(holidayRepository.findById("h1")).thenReturn(Optional.of(existing));
        when(holidayRepository.findByDate(LocalDate.of(2026, 10, 3))).thenReturn(Optional.of(other));

        HolidayRequest updateRequest = new HolidayRequest("Holiday 1", LocalDate.of(2026, 10, 3), "Desc 1");

        assertThrows(DuplicateHolidayException.class, () -> holidayService.updateHoliday("h1", updateRequest));
        verify(holidayRepository, never()).save(any());
    }

    @Test
    void deleteHoliday_successful() {
        Holiday existing = new Holiday("h1", "Holiday 1", LocalDate.of(2026, 10, 2), "Desc", LocalDate.now());
        when(holidayRepository.findById("h1")).thenReturn(Optional.of(existing));

        holidayService.deleteHoliday("h1");

        verify(holidayRepository).delete(existing);
    }

    @Test
    void deleteHoliday_throwsNotFound_whenNonexistent() {
        when(holidayRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(HolidayNotFoundException.class, () -> holidayService.deleteHoliday("unknown"));
    }
}
