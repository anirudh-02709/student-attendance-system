package com.student.attendance.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.student.attendance.dto.HolidayRequest;
import com.student.attendance.dto.HolidayResponse;

public interface HolidayService {

    HolidayResponse addHoliday(HolidayRequest request);

    List<HolidayResponse> getAllHolidays();

    Page<HolidayResponse> getHolidays(Pageable pageable);

    HolidayResponse getHolidayById(String id);

    HolidayResponse updateHoliday(String id, HolidayRequest request);

    void deleteHoliday(String id);
}
