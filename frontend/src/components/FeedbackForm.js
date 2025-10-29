import React, { useState } from 'react';

const FeedbackForm = ({ onSubmit, disabled }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    comments: '',
    rating: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'studentName':
        if (!value.trim()) {
          newErrors.studentName = 'Student name is required';
        } else if (value.trim().length < 2) {
          newErrors.studentName = 'Name must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.studentName = 'Name can only contain letters and spaces';
        } else {
          delete newErrors.studentName;
        }
        break;

      case 'courseCode':
        if (!value.trim()) {
          newErrors.courseCode = 'Course code is required';
        } else if (!/^[A-Za-z0-9]{3,10}$/.test(value.trim())) {
          newErrors.courseCode = 'Course code must be 3-10 alphanumeric characters';
        } else {
          delete newErrors.courseCode;
        }
        break;

      case 'rating':
        if (!value) {
          newErrors.rating = 'Please select a rating';
        } else if (value < 1 || value > 5) {
          newErrors.rating = 'Please select a valid rating between 1 and 5';
        } else {
          delete newErrors.rating;
        }
        break;

      case 'comments':
        if (!value.trim()) {
          newErrors.comments = 'Comments are required';
        } else if (value.trim().length < 10) {
          newErrors.comments = 'Comments must be at least 10 characters long';
        } else if (value.trim().length > 500) {
          newErrors.comments = 'Comments cannot exceed 500 characters';
        } else {
          delete newErrors.comments;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change if it's been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      studentName: true,
      courseCode: true,
      rating: true,
      comments: true
    };
    setTouched(allTouched);

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    if (validateForm()) {
      onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        studentName: '',
        courseCode: '',
        comments: '',
        rating: ''
      });
      setTouched({});
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('.is-invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const getCharacterCount = () => {
    return formData.comments.length;
  };

  const isSubmitDisabled = disabled || Object.keys(errors).length > 0;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title mb-0">Submit Course Feedback</h3>
            <small className="text-white-50">All fields are required</small>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* Student Name Field */}
              <div className="mb-3">
                <label htmlFor="studentName" className="form-label">
                  Student Name *
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.studentName && touched.studentName ? 'is-invalid' : ''}${!errors.studentName && touched.studentName && formData.studentName ? 'is-valid' : ''}`}
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  disabled={disabled}
                  maxLength="50"
                />
                {errors.studentName && touched.studentName && (
                  <div className="invalid-feedback">
                    {errors.studentName}
                  </div>
                )}
                {!errors.studentName && touched.studentName && formData.studentName && (
                  <div className="valid-feedback">Looks good!</div>
                )}
              </div>

              {/* Course Code Field */}
              <div className="mb-3">
                <label htmlFor="courseCode" className="form-label">
                  Course Code *
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.courseCode && touched.courseCode ? 'is-invalid' : ''}${!errors.courseCode && touched.courseCode && formData.courseCode ? 'is-valid' : ''}`}
                  id="courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., BIWA2110"
                  disabled={disabled}
                  maxLength="10"
                  style={{textTransform: 'uppercase'}}
                />
                {errors.courseCode && touched.courseCode && (
                  <div className="invalid-feedback">{errors.courseCode}</div>
                )}
                {!errors.courseCode && touched.courseCode && formData.courseCode && (
                  <div className="valid-feedback">Valid course code!</div>
                )}
              </div>

              {/* Rating Field */}
              <div className="mb-3">
                <label htmlFor="rating" className="form-label">
                  Rating (1-5) *
                </label>
                <select
                  className={`form-select ${errors.rating && touched.rating ? 'is-invalid' : ''}${!errors.rating && touched.rating && formData.rating ? 'is-valid' : ''}`}
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                >
                  <option value="">Select a rating...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
                {errors.rating && touched.rating && (
                  <div className="invalid-feedback">{errors.rating}</div>
                )}
                {!errors.rating && touched.rating && formData.rating && (
                  <div className="valid-feedback">Rating selected!</div>
                )}
              </div>

              {/* Comments Field */}
              <div className="mb-3">
                <label htmlFor="comments" className="form-label">
                  Comments *
                  <small className="text-muted ms-2">
                    {getCharacterCount()}/500 characters
                    {formData.comments.length < 10 && ` (minimum 10 required)`}
                  </small>
                </label>
                <textarea
                  className={`form-control ${errors.comments && touched.comments ? 'is-invalid' : ''}${!errors.comments && touched.comments && formData.comments ? 'is-valid' : ''}`}
                  id="comments"
                  name="comments"
                  rows="4"
                  value={formData.comments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Please provide detailed feedback about the course (minimum 10 characters)..."
                  disabled={disabled}
                  maxLength="500"
                />
                {errors.comments && touched.comments && (
                  <div className="invalid-feedback">{errors.comments}</div>
                )}
                {!errors.comments && touched.comments && formData.comments && (
                  <div className="valid-feedback">Great feedback!</div>
                )}
                <div className="form-text">
                  Please provide meaningful feedback to help improve the course.
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2"
                disabled={isSubmitDisabled}
              >
                {disabled ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>

              {/* Form Level Errors */}
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-warning mt-3">
                  <strong>Please fix the following errors:</strong>
                  <ul className="mb-0 mt-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;