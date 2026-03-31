import React from "react";
import Header from "@/components/Header";

const DashboardPage = () => {
  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
      </div>
    </div>
  );
};

export default DashboardPage;