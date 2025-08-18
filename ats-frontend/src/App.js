import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import ApplicationForm from './components/ApplicationForm';
 import SuccessPage from './pages/success';
import AdminView from './pages/AdminView';


function App() {
  return (
    <>
      <div>Test Render</div>
      <Router>
        <Routes>
          <Route path="/" element={<ApplicationForm />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
