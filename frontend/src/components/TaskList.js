import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import taskService from '../services/taskService';
import TaskItem from './TaskItem';

function TaskList({ refreshToken }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await taskService.getAll();
        if (active) {
          setTasks(response.data);
          setError('');
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Tasks could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTasks();
    return () => { active = false; };
  }, [refreshToken]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The task could not be deleted.');
    }
  };

  if (loading) return <p className="status-message">Loading tasks...</p>;
  if (error) return <p className="status-message error-message" role="alert">{error}</p>;

  return (
    <section className="task-list" aria-labelledby="task-list-heading">
      <div className="list-heading">
        <div>
          <span className="eyebrow">Your focus</span>
          <h2 id="task-list-heading">All tasks</h2>
        </div>
        <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
      </div>
      {tasks.length === 0 ? <p className="empty-state">Nothing here yet. Add your first task.</p> : (
        <div className="task-items">{tasks.map((task) => <TaskItem key={task.id} task={task} onDelete={handleDelete} />)}</div>
      )}
    </section>
  );
}

TaskList.propTypes = { refreshToken: PropTypes.number.isRequired };

export default TaskList;