import { useState } from 'react';
import PropTypes from 'prop-types';
import taskService from '../services/taskService';

function TaskForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      setError('Title must be between 3 and 100 characters.');
      return;
    }
    if (!trimmedDescription || trimmedDescription.length > 1000) {
      setError('Description is required and must be 1000 characters or fewer.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await taskService.create({ title: trimmedTitle, description: trimmedDescription });
      setTitle('');
      setDescription('');
      onCreated();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The task could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span className="eyebrow">New item</span>
        <h2>Add a task</h2>
      </div>
      <label htmlFor="task-title">Title</label>
      <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="100" />
      <label htmlFor="task-description">Description</label>
      <textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength="1000" rows="4" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add task'}
      </button>
    </form>
  );
}

TaskForm.propTypes = { onCreated: PropTypes.func.isRequired };

export default TaskForm;