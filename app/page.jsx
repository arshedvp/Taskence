'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskModal from '../components/AddTaskModal.jsx';
import DeleteConfirmationModal from '@/components/deleteModal.jsx';
import Navbar from '../components/Navbar.jsx';
import {
  Plus, Filter, Search, Calendar, User, Flag,
  CheckCircle, Clock, AlertCircle, Edit, Trash2
} from 'lucide-react';

// ... (categoryColors and statusOptions remain the same)
const categoryColors = {
  Work: 'bg-blue-50 text-blue-700',
  Personal: 'bg-green-50 text-green-700',
  Urgent: 'bg-red-50 text-red-700',
  Meeting: 'bg-purple-50 text-purple-700',
  Default: 'bg-gray-100 text-gray-600'
};

const statusOptions = [
  { value: '', label: 'All Tasks' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Done', label: 'Completed' }
];

// Custom hook for debouncing (from previous step)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Home() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ completed: 0, pending: 0, important: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
    setCurrentPage(1);
  }, [status, statusFilter, debouncedSearchTerm]);


  async function fetchStats() {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        const allTasks = data.tasks || [];
        setStats({
          completed: allTasks.filter(t => t.status === 'Done').length,
          pending: allTasks.filter(t => t.status === 'Pending').length,
          important: allTasks.filter(t => t.isImportant).length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats data:', error);
    }
  }

  async function fetchTasks() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }

  // --- All mutation functions (add, delete, update) remain the same ---
  // ...

    const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  async function handleDelete() {
    try {
      const res = await fetch(`/api/tasks/${taskToDelete._id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
        fetchStats();
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }

  async function addTask(task) {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  const handleUpdateTask = async (updatedTask) => {
    try {
      const res = await fetch(`/api/tasks/${updatedTask._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchTasks();
        fetchStats();
      }
    } catch (err)
 {
      console.error("Error updating task:", err);
    }
  };
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Pending': return <Clock className="h-5 w-5 text-amber-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category) => categoryColors[category] || categoryColors.Default;

  if (status === 'loading' && tasks.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading application...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-800">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header and Stats unchanged */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
            <p className="text-gray-500">A clean and simple overview of your tasks.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center cursor-pointer gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle />} iconBgClass="bg-green-100" textClass="text-green-600" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock />} iconBgClass="bg-amber-100" textClass="text-amber-600" />
          <StatCard label="Important" value={stats.important} icon={<Flag />} iconBgClass="bg-red-100" textClass="text-red-600" />
        </div>
        
        {/* Filter + Search unchanged */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                type="text"
                placeholder="Search tasks by title, description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none transition"
                />
            </div>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none transition"
            >
                {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>

        {/* --- TASKS GRID: THE FIX IS HERE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paginatedTasks.length === 0 ? (
            <div className="md:col-span-2 py-16 text-center text-gray-500 border-2 border-dashed rounded-lg bg-white">
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p>Try a different filter or create a new task to get started.</p>
            </div>
          ) : (
            paginatedTasks.map(task => (
              <div
                key={task._id}
                className="group bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:scale-[1.03]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                      {/* FIX: Check for and display task.creator.username instead of .name */}
                      {task.creator?.username && (
                        <p className="text-xs text-gray-500 mt-1">
                          Created by <span className="font-medium text-gray-700">{task.creator.username}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-start">
                      {task.isImportant && (
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full flex items-center gap-1 font-medium whitespace-nowrap">
                          <Flag className="h-3 w-3" /> Important
                        </span>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => { setSelectedTask(task); setShowEditModal(true); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer hover:text-gray-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => openDeleteModal(task)} className="p-1.5 rounded-md cursor-pointer hover:bg-red-50 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer and the rest of the component are correct */}
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        {getStatusIcon(task.status)}
                        {task.status}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category}
                        </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{task.createdAt && new Date(task.createdAt).toLocaleDateString()}</span>
                        </span>
                    </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Pagination and Modals remain unchanged */}
        <div className="flex justify-center gap-2 pt-4">
            {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm cursor-pointer font-medium transition-colors ${
                  currentPage === i + 1 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

        <TaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={addTask} mode="add" />
        <TaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleUpdateTask} task={selectedTask} mode="edit" />
        <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDelete} />
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, iconBgClass, textClass }) {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${iconBgClass} ${textClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${textClass}`}>{value}</p>
      </div>
    </div>
  );
}