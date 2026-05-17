import { useState } from 'react';

function MovieRatingForm({ disabled = false, submitLabel = 'Rate Movie', onSubmit }) {
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      rating: rating ? Number(rating) : null,
      review: review.trim() || null,
    });
    setRating('');
    setReview('');
  };

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <div className="rating-row">
        <input
          type="number"
          min="0"
          max="10"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          placeholder="Rating 0-10"
          aria-label="Rating 0 to 10"
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          {submitLabel}
        </button>
      </div>
      <textarea
        value={review}
        onChange={(event) => setReview(event.target.value)}
        placeholder="Short review"
        aria-label="Short review"
        rows="2"
        disabled={disabled}
      />
    </form>
  );
}

export default MovieRatingForm;
