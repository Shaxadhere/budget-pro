import React from "react";
import { motion } from "framer-motion";

const EmptyState = ({ title, description, icon: Icon, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 border-dashed rounded-xl"
    >
      <div className="bg-indigo-50 p-4 rounded-full mb-4">
        {Icon && <Icon className="h-8 w-8 text-indigo-500" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
