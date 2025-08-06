import React from 'react';
import './Success.css'; // Make sure this file exists in the same folder

const Success = () => {
  return (
    <div className="success-container">
      <h2>🎉 Application Submitted Successfully!</h2>
      <p>Thank you for applying. We will get back to you soon.</p>
      <button onClick={() => window.location.href = '/'}>Go Back Home</button>
    </div>
  );
};

export default Success;
