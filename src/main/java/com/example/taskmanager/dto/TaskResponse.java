package com.example.taskmanager.dto;

import com.example.taskmanager.entity.Task;
import java.time.LocalDateTime;

public record TaskResponse(Long id, String title, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getCreatedAt(), task.getUpdatedAt());
    }
}