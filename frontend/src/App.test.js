import { render, screen } from '@testing-library/react';
import App from './App';
import taskService from './services/taskService';

jest.mock('./services/taskService');

test('should render the task manager workspace', async () => {
  taskService.getAll.mockResolvedValue({ data: [] });
  render(<App />);
  expect(screen.getByRole('heading', { name: /make room/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Add a task' })).toBeInTheDocument();
  expect(await screen.findByText(/nothing here yet/i)).toBeInTheDocument();
});