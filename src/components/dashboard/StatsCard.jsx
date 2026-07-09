import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "indigo",
}) => {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${colorStyles[color] || colorStyles.indigo}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );
};

export default StatsCard;
