// TodoList.js
"use client";

import React, { useState, useEffect } from "react";
import Task from "./Task";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("school");
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function createTask(text) {
    if (!text.trim()) return;
    setTasks([...tasks, { id: Date.now(), text, completed: false, category }]);
    setText("");
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  // Drag & drop handlers:
  function handleDragStart(id) {
    setDraggedId(id);
  }
  function handleDragOver(e) {
    e.preventDefault(); // needed to allow drop
  }
  function handleDrop(targetId) {
    if (draggedId === null || draggedId === targetId) return;
    const fromIdx = tasks.findIndex((t) => t.id === draggedId);
    const toIdx = tasks.findIndex((t) => t.id === targetId);
    const updated = [...tasks];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setTasks(updated);
    setDraggedId(null);
  }

  // … your clearAllTasks, handleKeyDown, etc …

  const columns = [
    { key: "non-urgent", label: "Non-Urgent" },
    { key: "school", label: "Academic" },
    { key: "club/work", label: "Clubs/Work" },
  ];

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Chen’s Todo List
      </h1>
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-4">
        {/* … your add/clear UI … */}
        <div className="flex gap-4">
          {columns.map(({ key, label }) => (
            <div key={key} className="w-1/3">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                {label}
              </h2>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.category === key)
                  .map((task) => (
                    <Task
                      key={task.id}
                      task={task}
                      deleteTask={deleteTask}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
