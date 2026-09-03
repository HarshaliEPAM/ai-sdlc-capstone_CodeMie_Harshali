package com.example.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.repository.TaskRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    @Test
    void testCreate_ValidRequest_ReturnsSavedTask() {
        Task saved = new Task(1L, "Title", "Description", null, null);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        var result = taskService.create(new TaskRequest(" Title ", " Description "));

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.title()).isEqualTo("Title");
    }

    @Test
    void testFindById_MissingTask_ThrowsNotFound() {
        when(taskRepository.findById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.findById(7L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testDelete_ExistingTask_DeletesById() {
        when(taskRepository.existsById(1L)).thenReturn(true);

        taskService.delete(1L);

        verify(taskRepository).deleteById(1L);
    }
}