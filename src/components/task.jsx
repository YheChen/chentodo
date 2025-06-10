// Task.js
import React from "react";

export default function Task({
  task,
  deleteTask,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(task.id)}
      className="flex items-center justify-between mb-2 p-2 border rounded-md"
    >
      <span className="cursor-move mr-2">≡</span>
      <p className="text-gray-800">{task.text}</p>
      <button
        onClick={() => deleteTask(task.id)}
        className="text-red-500 hover:text-red-700 font-bold"
      >
        X
      </button>
    </div>
  );
}
