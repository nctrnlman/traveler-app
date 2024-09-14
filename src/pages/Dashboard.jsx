import React from "react";
import PhotoMap from "../components/PhotoMap";

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {" "}
      {/* Gunakan flex dan h-screen */}
      <header className="bg-teal-500 text-white p-4">
        <h1 className="text-2xl font-bold">Traveler Dashboard</h1>
      </header>
      <main className="flex-1">
        {" "}
        {/* Flex-1 agar mengisi sisa ruang */}
        <PhotoMap />
      </main>
    </div>
  );
};

export default Dashboard;
