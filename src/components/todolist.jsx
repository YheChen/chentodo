"use client";

import React, { useState } from "react";
import Task from "./task";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");

  function createTask(text) {
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setText("");
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function toggleCompleted(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Chen Todo List</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter a new task"
          />
          <button
            onClick={() => createTask(text)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {tasks.length === 0 && (
            <p className="text-gray-500 text-center">No Tasks</p>
          )}
          {tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              toggleCompleted={toggleCompleted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
