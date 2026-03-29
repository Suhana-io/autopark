import React from 'react';

const Test = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Tailwind is Working!</h1>
        <p className="text-gray-600">Your parking booking system is ready to go.</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default Test;