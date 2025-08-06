import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ApplicationForm from './Components/ApplicationForm';
import Success from './pages/Success';
import AdminDashboard from './Components/AdminDashboard';
import Navbar from './Components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
