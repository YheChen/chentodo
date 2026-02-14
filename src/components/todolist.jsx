"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

const categories = [
  { key: "non-urgent", label: "Non-Urgent" },
  { key: "school", label: "Academic" },
  { key: "club/work", label: "Clubs/Work" },
];

const emptyTasks = { "non-urgent": [], school: [], "club/work": [] };

export default function TodoList() {
  const { user, signOut } = useAuth();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("school");
  const [tasks, setTasks] = useState(emptyTasks);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState("");

  // Ref to skip writing back when we just received a remote update
  const isRemoteUpdate = useRef(false);

  // Upsert tasks to Supabase
  const saveTasks = useCallback(
    async (newTasks) => {
      if (!supabase || !user) return;
      const { error } = await supabase
        .from("user_tasks")
        .upsert(
          { user_id: user.id, tasks: newTasks },
          { onConflict: "user_id" },
        );

      if (error) {
        setSyncError("Failed to save tasks. Retrying on next change.");
        console.error("Failed to save tasks", error);
      } else {
        setSyncError("");
      }
    },
    [user],
  );

  // Fetch initial data + subscribe to real-time changes
  useEffect(() => {
    if (!supabase || !user) {
      setSyncing(false);
      return;
    }

    let isMounted = true;

    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from("user_tasks")
          .select("tasks")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          setSyncError("Unable to load tasks from Supabase.");
          console.error("Failed to load tasks", error);
        } else if (data?.tasks) {
          isRemoteUpdate.current = true;
          setTasks(data.tasks);
          setSyncError("");
        }
      } catch (error) {
        if (!isMounted) return;
        setSyncError("Unable to load tasks from Supabase.");
        console.error("Failed to load tasks", error);
      } finally {
        if (!isMounted) return;
        setSyncing(false);
      }
    };

    loadTasks();

    // Real-time subscription
    const channel = supabase
      .channel("user_tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new?.tasks) {
            isRemoteUpdate.current = true;
            setTasks(payload.new.tasks);
            setSyncError("");
          }
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setSyncError("Realtime sync is unavailable right now.");
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Write to Supabase on local changes
  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (!supabase || !user || syncing) return;

    saveTasks(tasks);
  }, [tasks, user, syncing, saveTasks]);

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

  function clearAllTasks() {
    if (
      !window.confirm("Confirm delete all tasks? This action cannot be undone.")
    )
      return;

    setTasks({ "non-urgent": [], school: [], "club/work": [] });
  }

  function deleteTask(cat, id) {
    setTasks((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((t) => t.id !== id),
    }));
  }

  function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCat = source.droppableId;
    const destCat = destination.droppableId;

    // same list reorder
    if (sourceCat === destCat) {
      if (source.index === destination.index) return;

      const newList = Array.from(tasks[sourceCat] || []);
      const [moved] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, moved);
      setTasks((prev) => ({ ...prev, [sourceCat]: newList }));
      return;
    }

    // move across lists
    const sourceList = Array.from(tasks[sourceCat] || []);
    const destList = Array.from(tasks[destCat] || []);
    const [moved] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, moved);

    setTasks((prev) => ({
      ...prev,
      [sourceCat]: sourceList,
      [destCat]: destList,
    }));
  }

  if (syncing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">Syncing tasks…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      {/* Header with sign-out */}
      <div className="w-full max-w-5xl grid grid-cols-[1fr_auto_1fr] items-center mb-6">
        <div aria-hidden="true"></div>
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Chen&apos;s Todo List
        </h1>
        <div className="flex items-center gap-3 justify-self-end">
          <span className="text-sm text-gray-500 hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {syncError ? (
        <div className="w-full max-w-5xl mb-4 px-4 py-2 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm">
          {syncError}
        </div>
      ) : null}

      {/* add / clear UI */}
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={clearAllTasks}
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
                <div className="w-1/3 bg-white rounded-lg shadow p-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                    {label}
                  </h2>

                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col gap-2 min-h-[1px]"
                  >
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
                              flex items-center justify-between p-2 border rounded-md
                              bg-white transition-shadow
                              ${snapshot.isDragging ? "shadow-lg" : "shadow-sm"}
                            `}
                          >
                            <div className="mr-2 flex flex-col gap-0.5 select-none">
                              <span className="block h-0.5 w-4 bg-gray-500 rounded"></span>
                              <span className="block h-0.5 w-4 bg-gray-500 rounded"></span>
                              <span className="block h-0.5 w-4 bg-gray-500 rounded"></span>
                            </div>
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
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
