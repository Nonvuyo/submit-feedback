const db = require('../config/database');

class Feedback {
  static create(feedback, callback) {
    const { studentName, courseCode, comments, rating } = feedback;
    const sql = `INSERT INTO Feedback (studentName, courseCode, comments, rating) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [studentName, courseCode, comments, rating], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAll(callback) {
    const sql = `SELECT * FROM Feedback ORDER BY createdAt DESC`;
    db.all(sql, [], callback);
  }

  static getByCourseCode(courseCode, callback) {
    const sql = `SELECT * FROM Feedback WHERE courseCode = ? ORDER BY createdAt DESC`;
    db.all(sql, [courseCode], callback);
  }
}

module.exports = Feedback;