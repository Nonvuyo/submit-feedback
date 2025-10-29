const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow all origins for now
app.use(cors({
  origin: "*",  // Allow all origins
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use in-memory storage for Render (no SQLite)
let feedbackData = [];
let nextId = 1;

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Feedback API is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET all feedback
app.get('/api/feedback', (req, res) => {
  try {
    // Return feedback sorted by newest first
    const sortedFeedback = [...feedbackData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// POST new feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { studentName, courseCode, comments, rating } = req.body;

    // Validation
    if (!studentName?.trim() || !courseCode?.trim() || !comments?.trim() || !rating) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (comments.trim().length < 10) {
      return res.status(400).json({ error: 'Comments must be at least 10 characters long' });
    }

    const newFeedback = {
      id: nextId++,
      studentName: studentName.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      comments: comments.trim(),
      rating: parseInt(rating),
      createdAt: new Date().toISOString()
    };

    feedbackData.push(newFeedback);
    
    console.log('New feedback submitted:', newFeedback);
    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      id: newFeedback.id,
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

// DELETE feedback
app.delete('/api/feedback/:id', (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    
    if (!feedbackId) {
      return res.status(400).json({ error: 'Valid feedback ID is required' });
    }

    const initialLength = feedbackData.length;
    feedbackData = feedbackData.filter(item => item.id !== feedbackId);
    
    if (feedbackData.length === initialLength) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    console.log('Feedback deleted with ID:', feedbackId);
    res.json({ 
      message: 'Feedback deleted successfully',
      deletedId: feedbackId
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Add some sample data for demo
if (process.env.NODE_ENV === 'production') {
  feedbackData = [
    {
      id: nextId++,
      studentName: 'John Doe',
      courseCode: 'BIWA2110',
      comments: 'Great course with excellent content and knowledgeable instructor!',
      rating: 5,
      createdAt: new Date('2024-01-15').toISOString()
    },
    {
      id: nextId++,
      studentName: 'Jane Smith',
      courseCode: 'COMP101',
      comments: 'Good material but could use more practical examples and exercises.',
      rating: 4,
      createdAt: new Date('2024-01-14').toISOString()
    },
    {
      id: nextId++,
      studentName: 'Mike Johnson',
      courseCode: 'BIWA2110',
      comments: 'The instructor was very knowledgeable and the course content was well structured.',
      rating: 5,
      createdAt: new Date('2024-01-13').toISOString()
    }
  ];
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Backend is ready!`);
});