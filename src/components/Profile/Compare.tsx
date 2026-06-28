"use client";
import { GitCompare } from "lucide-react";

const Compare: React.FC = () => {
  return (
    <div className="text-center py-16 text-gray-400">
      <GitCompare size={40} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium">No items to compare yet.</p>
      <p className="text-sm mt-1">Add products to compare them side-by-side.</p>
    </div>
  );
};

export default Compare;