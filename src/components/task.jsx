import React from "react";

export default function Task({ task, deleteTask, toggleCompleted }) {
  function handleChange() {
    toggleCompleted(task.id);
  }

  return (
    <div className="flex justify-between items-center mb-2 p-2 border rounded-md">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleChange}
          className="mr-2"
        />
        <p
          className={`${
            task.completed ? "text-gray-500 line-through" : "text-gray-800"
          }`}
        >
          {task.text}
        </p>
      </div>
      <button
        onClick={() => deleteTask(task.id)}
        className="text-red-500 hover:text-red-700 font-bold"
      >
        X
      </button>
    </div>
  );
}
