import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
import SuccessPage from './SuccessPage';
import AdminView from './pages/AdminView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </Router>
  );
}

export default App;
