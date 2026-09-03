package com.example.taskmanager.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.service.TaskService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TaskController.class)
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Test
    void testFindAll_ReturnsTasks_Ok() throws Exception {
        when(taskService.findAll()).thenReturn(List.of(new TaskResponse(1L, "Task", "Details", null, null)));

        mockMvc.perform(get("/api/tasks")).andExpect(status().isOk());
    }

    @Test
    void testCreate_InvalidRequest_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\",\"description\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreate_ValidRequest_ReturnsCreated() throws Exception {
        when(taskService.create(any(TaskRequest.class))).thenReturn(new TaskResponse(1L, "Task", "Details", null, null));

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Task\",\"description\":\"Details\"}"))
                .andExpect(status().isCreated());
    }
}