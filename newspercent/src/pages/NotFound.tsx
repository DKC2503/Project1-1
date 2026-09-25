import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--background-deep)] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black mb-4">404</h1>
      <p className="text-xl mb-8">Page Not Found</p>
      <Link to="/" className="px-6 py-3 bg-primary text-white rounded-lg font-bold">
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
