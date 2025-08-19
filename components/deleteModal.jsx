'use client';
import { Dialog } from '@headlessui/react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <Dialog.Panel className="bg-white rounded-xl p-6 z-50 max-w-sm mx-auto">
        <Dialog.Title className="text-lg font-bold text-red-600 mb-4">Confirm Deletion</Dialog.Title>
        <p className="text-gray-700 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
