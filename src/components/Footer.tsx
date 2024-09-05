'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-white p-4 text-center">
      <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
    </footer>
  );
};

export default Footer;