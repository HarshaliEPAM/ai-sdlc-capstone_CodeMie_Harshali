package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import java.util.List;

public interface TaskService {
    TaskResponse create(TaskRequest request);
    List<TaskResponse> findAll();
    TaskResponse findById(Long id);
    void delete(Long id);
}