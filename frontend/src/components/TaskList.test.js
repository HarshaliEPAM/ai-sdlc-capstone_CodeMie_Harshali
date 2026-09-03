import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from './TaskList';
import taskService from '../services/taskService';

jest.mock('../services/taskService');

test('should render tasks when loading succeeds', async () => {
  taskService.getAll.mockResolvedValue({ data: [{ id: 1, title: 'Read', description: 'Read notes' }] });
  render(<TaskList refreshToken={0} />);
  expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  expect(await screen.findByText('Read')).toBeInTheDocument();
});

test('should show an error when loading fails', async () => {
  taskService.getAll.mockRejectedValue({ response: { data: { message: 'Unavailable' } } });
  render(<TaskList refreshToken={0} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unavailable');
});

test('should delete a task after confirmation', async () => {
  taskService.getAll.mockResolvedValue({ data: [{ id: 2, title: 'Remove me', description: 'Old task' }] });
  taskService.delete.mockResolvedValue({});
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  const user = userEvent.setup();
  render(<TaskList refreshToken={0} />);
  await screen.findByText('Remove me');
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(taskService.delete).toHaveBeenCalledWith(2));
  expect(screen.queryByText('Remove me')).not.toBeInTheDocument();
  window.confirm.mockRestore();
});