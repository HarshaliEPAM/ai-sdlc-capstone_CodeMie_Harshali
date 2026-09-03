import PropTypes from 'prop-types';

function TaskItem({ task, onDelete }) {
  return (
    <article className="task-item">
      <div className="task-copy">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <button className="delete-button" type="button" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </article>
  );
}

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TaskItem;