package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
        String title,
        @NotBlank(message = "Description is required")
        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description) {
}