"use client";

export default function TaskCard({ task }) {
  const {
    title,
    description,
    status,
    category,
    isImportant,
    creator,
    createdAt,
  } = task;

  // Format date nicely
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="border rounded-lg shadow p-4 mb-4 bg-white relative">
      {/* Important tag */}
      {isImportant && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          Important
        </span>
      )}

      {/* Top Row */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-right text-sm text-gray-500">
          <div>{creator ?? "Unknown Creator"}</div>
          <div>{formattedDate}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-center text-gray-700 mb-4">{description}</p>

      {/* Bottom Row */}
      <div className="flex justify-center space-x-6 text-sm text-gray-600 font-medium">
        <div>
          <span className="font-semibold">Status:</span> {status}
        </div>
        <div>
          <span className="font-semibold">Category:</span> {category}
        </div>
      </div>
    </div>
  );
}
