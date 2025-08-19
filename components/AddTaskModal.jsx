"use client";
import { useState, useEffect } from "react";
import { X, CheckSquare, FileText, Calendar, Tag, Flag } from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "add",
  task = {}
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [isImportant, setIsImportant] = useState(false);
  const [category, setCategory] = useState("General");

  // Effect to populate form when editing a task or reset for adding
  // **FIX:** The dependency array is now stable and will not cause re-runs on every keystroke.
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setTitle(task.title || "");
        setDescription(task.description || "");
        setStatus(task.status || "Pending");
        setIsImportant(task.isImportant || false);
        setCategory(task.category || "General");
      } else {
        // Reset form for "add" mode when modal opens
        setTitle("");
        setDescription("");
        setStatus("Pending");
        setIsImportant(false);
        setCategory("General");
      }
    }
  }, [isOpen, mode, task?._id]); // Using task._id makes the dependency stable

  const categoryOptions = [
    { value: "General", label: "General" },
    { value: "Work", label: "Work" },
    { value: "Personal", label: "Personal" },
    { value: "Urgent", label: "Urgent" },
    { value: "Meeting", label: "Meeting" },
    { value: "Project", label: "Project" },
  ];

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      ...task, // Pass existing task data, including _id if editing
      title: title.trim(),
      description: description.trim(),
      status,
      isImportant,
      category,
    });

    // This part is now technically redundant because of the useEffect,
    // but it ensures the form is visually cleared instantly for a better UX.
    if (mode === "add") {
      setTitle("");
      setDescription("");
      setStatus("Pending");
      setIsImportant(false);
      setCategory("General");
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const inputStyle = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none transition";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "Edit Task" : "Create a New Task"}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === "edit" ? "Update the details below." : "Fill in the details to add a task."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g., Design the new dashboard"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Add more details about your task..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows="4"
              className={`${inputStyle} resize-none`}
            />
          </div>

          {/* Status and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputStyle}>
                <option value="Pending">Pending</option>
                <option value="Done">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputStyle}>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Important Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
            <div
              onClick={() => setIsImportant(!isImportant)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isImportant
                  ? 'border-red-300 bg-red-50 hover:bg-red-100'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isImportant
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300 bg-white'
                }`}>
                  {isImportant && <Flag className="h-3 w-3 text-white" />}
                </div>
                <span className={`font-medium ${isImportant ? 'text-red-700' : 'text-gray-600'}`}>
                  Mark as Important
                </span>
              </div>
              {isImportant && (
                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  HIGH PRIORITY
                </span>
              )}
            </div>
          </div>
           {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 cursor-pointer bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 cursor-pointer bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {mode === "edit" ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}