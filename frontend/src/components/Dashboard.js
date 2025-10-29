import React from 'react';

const Dashboard = ({ feedback }) => {
  // Calculate statistics
  const totalFeedback = feedback.length;
  
  const averageRating = totalFeedback > 0 
    ? (feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback).toFixed(1)
    : 0;

  const courseStats = feedback.reduce((acc, item) => {
    if (!acc[item.courseCode]) {
      acc[item.courseCode] = { count: 0, totalRating: 0 };
    }
    acc[item.courseCode].count++;
    acc[item.courseCode].totalRating += item.rating;
    return acc;
  }, {});

  const ratingDistribution = [0, 0, 0, 0, 0]; // for ratings 1-5
  feedback.forEach(item => {
    ratingDistribution[item.rating - 1]++;
  });

  return (
    <div>
      <h2 className="mb-4">Feedback Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h4 className="card-title">{totalFeedback}</h4>
              <p className="card-text">Total Feedback</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h4 className="card-title">{averageRating}/5</h4>
              <p className="card-text">Average Rating</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h4 className="card-title">{Object.keys(courseStats).length}</h4>
              <p className="card-text">Courses Rated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Course Statistics */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Course Statistics</h5>
            </div>
            <div className="card-body">
              {Object.keys(courseStats).length === 0 ? (
                <p className="text-muted">No feedback data available.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Feedback Count</th>
                        <th>Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(courseStats).map(([courseCode, stats]) => (
                        <tr key={courseCode}>
                          <td>{courseCode}</td>
                          <td>{stats.count}</td>
                          <td>{(stats.totalRating / stats.count).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Rating Distribution</h5>
            </div>
            <div className="card-body">
              {totalFeedback === 0 ? (
                <p className="text-muted">No ratings available.</p>
              ) : (
                <div>
                  {ratingDistribution.map((count, index) => {
                    const rating = index + 1;
                    const percentage = totalFeedback > 0 ? (count / totalFeedback * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={rating} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>
                            {rating} star{rating !== 1 ? 's' : ''}
                          </span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${percentage}%` }}
                          >
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;