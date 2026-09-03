package com.example.taskmanager.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(LocalDateTime timestamp, int status, String message, Map<String, String> errors) {
    public ErrorResponse(LocalDateTime timestamp, int status, String message) {
        this(timestamp, status, message, Map.of());
    }
}