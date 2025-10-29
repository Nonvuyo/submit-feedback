require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Improved CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup with environment variable
const dbPath = path.join(__dirname, process.env.DB_PATH || 'feedback.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.run(`CREATE TABLE IF NOT EXISTS Feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentName TEXT NOT NULL,
      courseCode TEXT NOT NULL,
      comments TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Feedback table ready.');
      }
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Feedback API is running!',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      'GET /api/feedback': 'Get all feedback',
      'POST /api/feedback': 'Submit new feedback',
      'DELETE /api/feedback/:id': 'Delete feedback by ID'
    }
  });
});

// GET all feedback
app.get('/api/feedback', (req, res) => {
  console.log('GET /api/feedback requested');
  const sql = `SELECT * FROM Feedback ORDER BY createdAt DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    console.log(`Returning ${rows.length} feedback items`);
    res.json(rows);
  });
});

// POST new feedback
app.post('/api/feedback', (req, res) => {
  console.log('POST /api/feedback received:', req.body);
  
  try {
    const { studentName, courseCode, comments, rating } = req.body;

    // Enhanced validation with detailed messages
    if (!studentName?.trim() || !courseCode?.trim() || !comments?.trim() || !rating) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: {
          studentName: !studentName?.trim() ? 'Student name is required' : null,
          courseCode: !courseCode?.trim() ? 'Course code is required' : null,
          comments: !comments?.trim() ? 'Comments are required' : null,
          rating: !rating ? 'Rating is required' : null
        }
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5',
        received: rating 
      });
    }

    if (comments.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Comments must be at least 10 characters long',
        currentLength: comments.trim().length 
      });
    }

    if (studentName.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Student name must be at least 2 characters long'
      });
    }

    const sql = `INSERT INTO Feedback (studentName, courseCode, comments, rating) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [studentName.trim(), courseCode.trim(), comments.trim(), parseInt(rating)], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create feedback' });
      }
      console.log('Feedback created with ID:', this.lastID);
      res.status(201).json({ 
        message: 'Feedback submitted successfully', 
        id: this.lastID,
        feedback: {
          id: this.lastID,
          studentName: studentName.trim(),
          courseCode: courseCode.trim(),
          comments: comments.trim(),
          rating: parseInt(rating)
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// DELETE feedback
app.delete('/api/feedback/:id', (req, res) => {
  const feedbackId = parseInt(req.params.id);
  console.log('DELETE /api/feedback requested for ID:', feedbackId);

  if (!feedbackId || isNaN(feedbackId)) {
    return res.status(400).json({ error: 'Valid feedback ID is required' });
  }

  const sql = `DELETE FROM Feedback WHERE id = ?`;
  
  db.run(sql, [feedbackId], function(err) {
    if (err) {
      console.error('Error deleting feedback:', err);
      return res.status(500).json({ error: 'Failed to delete feedback' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    console.log('Feedback deleted with ID:', feedbackId);
    res.json({ 
      message: 'Feedback deleted successfully',
      deletedId: feedbackId
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`✅ Backend is ready!`);
});