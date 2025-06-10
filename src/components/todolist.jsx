"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Task from "./task";

const categories = [
  { key: "non-urgent", label: "Non-Urgent" },
  { key: "school", label: "Academic" },
  { key: "club/work", label: "Clubs/Work" },
];

export default function TodoList() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("school");
  const [tasks, setTasks] = useState({
    "non-urgent": [],
    school: [],
    "club/work": [],
  });

  // load
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);
  // save
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function createTask() {
    if (!text.trim()) return;

    const newTask = { id: Date.now().toString(), text };

    setTasks((prev) => ({
      ...prev,
      [category]: [
        ...(Array.isArray(prev[category]) ? prev[category] : []),
        newTask,
      ],
    }));

    setText("");
  }

  function deleteTask(cat, id) {
    setTasks((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((t) => t.id !== id),
    }));
  }

  function onDragEnd(result) {
    const { source, destination } = result;
    if (
      !destination ||
      source.droppableId !== destination.droppableId ||
      source.index === destination.index
    ) {
      return;
    }
    const cat = source.droppableId;
    const newList = Array.from(tasks[cat]);
    const [moved] = newList.splice(source.index, 1);
    newList.splice(destination.index, 0, moved);
    setTasks((prev) => ({ ...prev, [cat]: newList }));
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Chen’s Todo List
      </h1>

      {/* add / clear UI */}
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() =>
              setTasks({ "non-urgent": [], school: [], "club/work": [] })
            }
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Clear All
          </button>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTask()}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter new task"
          />
          <button
            onClick={createTask}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* drag-and-drop lists */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 w-full max-w-5xl">
          {categories.map(({ key, label }) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-1/3 bg-white rounded-lg shadow p-4"
                >
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                    {label}
                  </h2>

                  {(tasks[key] || []).map((task, index) => (
                    <Draggable
                      draggableId={task.id}
                      index={index}
                      key={task.id}
                    >
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`
                            flex items-center justify-between mb-2 p-2 border rounded-md
                            bg-white transition-shadow
                            ${snapshot.isDragging ? "shadow-lg" : "shadow-sm"}
                          `}
                        >
                          <span className="mr-2 select-none">≡</span>
                          <p className="flex-1 text-gray-800">{task.text}</p>
                          <button
                            onClick={() => deleteTask(key, task.id)}
                            className="text-red-500 hover:text-red-700 font-bold ml-2"
                          >
                            X
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
