import React, { useEffect, useState } from "react";
import axios from "axios";

type Task = {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5026";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");

  // Load tasks from backend
// inside App() - replace the existing useEffect(...) that loads tasks
useEffect(() => {
  // Init: prefer backend data; fallback to localStorage if backend is unreachable
  const init = async () => {
    try {
      const res = await axios.get<Task[]>(`${API_BASE}/api/tasks`);
      setTasks(res.data);
      // keep local copy for quick reloads / offline
      localStorage.setItem("tasks", JSON.stringify(res.data));
    } catch (err) {
      // if backend call fails, restore from localStorage (if present)
      const saved = localStorage.getItem("tasks");
      if (saved) setTasks(JSON.parse(saved));
      else setTasks([]); // nothing available
    }
  };

  init();
}, []);


  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);


  async function fetchTasks() {
    const res = await axios.get<Task[]>(`${API_BASE}/api/tasks`);
    setTasks(res.data);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await axios.post<Task>(`${API_BASE}/api/tasks`, { title, description });
    setTasks(prev => [res.data, ...prev]);
    setTitle("");
    setDescription("");
  }

  async function toggleTask(id: number) {
    const res = await axios.put<Task>(`${API_BASE}/api/tasks/${id}/toggle`);
    setTasks(prev => prev.map(t => (t.id === id ? res.data : t)));
  }

  async function deleteTask(id: number) {
    await axios.delete(`${API_BASE}/api/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="container py-4">
        <h1 className="text-center mb-4">📝 Task Manager</h1>

        <form onSubmit={addTask} className="d-flex gap-2 mb-3">
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <input
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <button className="btn btn-primary" type="submit">
            Add
          </button>
        </form>

        <div className="text-center mb-3">
          <div className="btn-group">
            <button className={`btn btn-${filter === "all" ? "primary" : "secondary"}`} onClick={() => setFilter("all")}>All</button>
            <button className={`btn btn-${filter === "active" ? "primary" : "secondary"}`} onClick={() => setFilter("active")}>Active</button>
            <button className={`btn btn-${filter === "completed" ? "primary" : "secondary"}`} onClick={() => setFilter("completed")}>Completed</button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center">No tasks yet!</p>
        ) : (
          <ul className="list-group">
            {tasks
              .filter(t =>
                filter === "all" ? true :
                filter === "completed" ? t.isCompleted :
                !t.isCompleted
              )
              .map((t, index) => (
                <li key={t.id ?? index} className="list-group-item d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={t.isCompleted}
                    onChange={() => toggleTask(t.id)}
                  />
                  <div className="flex-grow-1">
                    <span style={{ textDecoration: t.isCompleted ? "line-through" : "none" }}>
                      {t.title}
                    </span>
                    {t.description && <div className="text-muted small">{t.description}</div>}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTask(t.id)}>Delete</button>
                </li>
              ))}
          </ul>
        )}
      </div>

  );
}
