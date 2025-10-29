import React, { useState } from 'react';

const FeedbackList = ({ feedback, onFeedbackUpdate }) => {
  const [filterCourse, setFilterCourse] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filteredFeedback = filterCourse
    ? feedback.filter(item => 
        item.courseCode.toLowerCase().includes(filterCourse.toLowerCase()))
    : feedback;

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  };

  const getRatingText = (rating) => {
    const ratings = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratings[rating] || 'Unknown';
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    setDeletingId(feedbackId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        alert('Feedback deleted successfully!');
        if (onFeedbackUpdate) {
          onFeedbackUpdate();
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete feedback. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Course Feedback</h2>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by course code..."
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          />
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          No feedback found. {filterCourse && 'Try changing your filter.'}
        </div>
      ) : (
        <div className="row">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="col-md-6 mb-3">
              <div className="card h-100 feedback-card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="h5 mb-0">{item.courseCode}</strong>
                    <span className={`badge bg-${getRatingColor(item.rating)} ms-2`}>
                      {item.rating}/5 - {getRatingText(item.rating)}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    title="Delete feedback"
                  >
                    {deletingId === item.id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
                <div className="card-body">
                  <p className="card-text feedback-comments">{item.comments}</p>
                  
                  <div className="rating-stars mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= item.rating ? 'filled' : ''}`}
                        style={{
                          color: star <= item.rating ? '#ffc107' : '#e4e5e9',
                          fontSize: '1.2rem',
                          marginRight: '2px'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card-footer text-muted d-flex justify-content-between">
                  <small>
                    <strong>By:</strong> {item.studentName}
                  </small>
                  <small>
                    {formatDate(item.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-center text-muted">
        <small>
          Showing {filteredFeedback.length} of {feedback.length} feedback entries
          {filterCourse && ` filtered by "${filterCourse}"`}
        </small>
      </div>
    </div>
  );
};

export default FeedbackList;