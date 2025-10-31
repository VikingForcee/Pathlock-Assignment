import React from "react";

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    isCompleted: boolean;
  };
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "8px",
        borderRadius: "6px",
      }}
    >
      <span
        onClick={onToggle}
        style={{
          textDecoration: task.isCompleted ? "line-through" : "none",
          cursor: "pointer",
        }}
      >
        {task.title}
      </span>
      <button
        onClick={onDelete}
        style={{ background: "red", color: "white", borderRadius: "4px" }}
      >
        Delete
      </button>
    </div>
  );
}
