import { Star } from "lucide-react";

export function StarRating({ rating, size = 16, showValue = true }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="text-yellow-400 fill-yellow-400" style={{ width: size, height: size }} />
        ))}
        {hasHalf && (
          <div className="relative" style={{ width: size, height: size }}>
            <Star className="absolute text-gray-300" style={{ width: size, height: size }} />
            <div className="absolute overflow-hidden" style={{ width: size / 2 }}>
              <Star className="text-yellow-400 fill-yellow-400" style={{ width: size, height: size }} />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="text-gray-300" style={{ width: size, height: size }} />
        ))}
      </div>
      {showValue && (
        <span className="text-muted-foreground ml-1" style={{ fontSize: '0.875rem' }}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

export function StarRatingInput({ value, onChange, size = 24 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  );
}
