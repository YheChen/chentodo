"use client";

import React, { useState, useEffect } from "react";
import Task from "./task";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("school");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function createTask(text) {
    if (text.trim() === "") return;
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      category,
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

  function clearAllTasks() {
    setTasks([]);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && text.trim()) {
      createTask(text);
    }
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Chen's Todo List
      </h1>
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={clearAllTasks}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Clear
          </button>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="school">School</option>
            <option value="non-urgent">Non-Urgent</option>
            <option value="club/work">Club/Work</option>
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter new task"
          />
          <button
            onClick={() => createTask(text)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>
        <div className="flex gap-4">
          <div className="w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Non-Urgent
            </h2>
            <div className="space-y-2">
              {tasks
                .filter((task) => task.category === "non-urgent")
                .map((task) => (
                  <Task
                    key={task.id}
                    task={task}
                    deleteTask={deleteTask}
                    toggleCompleted={toggleCompleted}
                  />
                ))}
            </div>
          </div>
          <div className="w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Academic
            </h2>
            <div className="space-y-2">
              {tasks
                .filter((task) => task.category === "school")
                .map((task) => (
                  <Task
                    key={task.id}
                    task={task}
                    deleteTask={deleteTask}
                    toggleCompleted={toggleCompleted}
                  />
                ))}
            </div>
          </div>
          <div className="w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Clubs/Work
            </h2>
            <div className="space-y-2">
              {tasks
                .filter((task) => task.category === "club/work")
                .map((task) => (
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
      </div>
    </div>
  );
}
