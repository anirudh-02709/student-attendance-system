package com.student.attendance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data; // setName(), getName(), setBranch(), getBranch(), setYear(), getYear()
import lombok.NoArgsConstructor;

@Document(collection = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    private String usn;

    private String name;

    private String branch;

    private int year;

}