package com.student.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.student.attendance.model.Holiday;

@Repository
public interface HolidayRepository extends MongoRepository<Holiday, String> {

    List<Holiday> findAllByOrderByDateAsc();

    Page<Holiday> findAllByOrderByDateAsc(Pageable pageable);

    Optional<Holiday> findByDate(LocalDate date);

    boolean existsByDate(LocalDate date);

    List<Holiday> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
}
