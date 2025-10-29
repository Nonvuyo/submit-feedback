import React, { useState, useEffect } from 'react';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('form');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the working backend URL
  const API_BASE = 'https://submit-feedback-1.onrender.com/api';

  const fetchFeedback = async () => {
    try {
      setError('');
      console.log('🔵 Fetching feedback from:', `${API_BASE}/feedback`);
      const response = await fetch(`${API_BASE}/feedback`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Feedback data received:', data);
      setFeedback(data);
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Cannot connect to server. Please check if the backend is running.');
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleFeedbackSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      console.log('🟡 Submitting feedback:', formData);

      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('🟡 Response status:', response.status);
      
      const result = await response.json();
      console.log('🟡 Response data:', result);

      if (response.ok) {
        alert('✅ Feedback submitted successfully!');
        await fetchFeedback();
        setCurrentView('list');
      } else {
        // Enhanced error handling with validation details
        if (result.details) {
          const errorDetails = Object.values(result.details).filter(detail => detail !== null).join(', ');
          throw new Error(errorDetails || result.error);
        }
        throw new Error(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      setError(error.message);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackDelete = async (feedbackId) => {
    try {
      console.log('🟡 Deleting feedback with ID:', feedbackId);
      
      const response = await fetch(`${API_BASE}/feedback/${feedbackId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      console.log('🟡 Delete response:', result);

      if (response.ok) {
        alert('✅ Feedback deleted successfully!');
        await fetchFeedback(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Student Feedback App</span>
          <div className="navbar-nav">
            <button 
              className={`nav-link btn btn-link ${currentView === 'form' ? 'active' : ''}`}
              onClick={() => setCurrentView('form')}
            >
              Submit Feedback
            </button>
            <button 
              className={`nav-link btn btn-link ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              View Feedback
            </button>
            <button 
              className={`nav-link btn btn-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {error && (
          <div className="alert alert-warning">
            <strong>Note:</strong> {error}
          </div>
        )}
        
        {loading && (
          <div className="alert alert-info text-center">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Submitting feedback, please wait...
          </div>
        )}
        
        {currentView === 'form' && (
          <FeedbackForm onSubmit={handleFeedbackSubmit} disabled={loading} />
        )}
        {currentView === 'list' && (
          <FeedbackList feedback={feedback} onFeedbackUpdate={handleFeedbackDelete} />
        )}
        {currentView === 'dashboard' && (
          <Dashboard feedback={feedback} />
        )}
      </div>
    </div>
  );
}

export default App;