import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';
import taskService from '../services/taskService';

jest.mock('../services/taskService');

test('should create a task when the form is valid', async () => {
  taskService.create.mockResolvedValue({ data: { id: 1 } });
  const user = userEvent.setup();
  const onCreated = jest.fn();
  render(<TaskForm onCreated={onCreated} />);
  await user.type(screen.getByLabelText('Title'), 'Plan the week');
  await user.type(screen.getByLabelText('Description'), 'Review priorities');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  await waitFor(() => expect(taskService.create).toHaveBeenCalledWith({ title: 'Plan the week', description: 'Review priorities' }));
  expect(onCreated).toHaveBeenCalled();
});

test('should show validation when title is too short', async () => {
  const user = userEvent.setup();
  render(<TaskForm onCreated={jest.fn()} />);
  await user.type(screen.getByLabelText('Title'), 'x');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Title must be between');
  expect(taskService.create).not.toHaveBeenCalled();
});