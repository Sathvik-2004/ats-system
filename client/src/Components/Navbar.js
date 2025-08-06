// client/src/Components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional: Create this file if you want styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Apply</Link></li>
        <li><Link to="/admin">Admin Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
