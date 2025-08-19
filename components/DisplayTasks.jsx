"use client";
import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";

export default function TaskList({ tasks }) {
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  useEffect(() => {
    console.log("Tasks received:", tasks);
    console.log("Current Page:", currentPage);
  }, [tasks, currentPage]);

  if (!tasks || tasks.length === 0) {
    return <p className="text-center text-gray-500">No tasks found.</p>;
  }

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  return (
    <div className="space-y-4">
      {currentTasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
