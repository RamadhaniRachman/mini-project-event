import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventDetail() {
  const { id } = useParams();

  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // review form
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);

  // ticket
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [loadingBuy, setLoadingBuy] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setReviews(data.reviews || []);
      });
  }, [id]);

  // ==========================
  // BUY TICKET
  // ==========================
  const handleBuy = () => {
    setLoadingBuy(true);

    fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: event.id,
        quantity,
        coupon_code: coupon,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Transaction success!");
        setOpen(false);
      })
      .finally(() => setLoadingBuy(false));
  };

  // ==========================
  // REVIEW
  // ==========================
  const handleSubmitReview = () => {
    setLoadingReview(true);

    fetch("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: Number(id),
        rating,
        feedback,
        suggestions,
      }),
    })
      .then((res) => res.json())
      .then((newReview) => {
        setReviews((prev) => [newReview, ...prev]);
        setFeedback("");
        setSuggestions("");
      })
      .finally(() => setLoadingReview(false));
  };

  if (!event) {
    return <div className="text-white p-10">Loading...</div>;
  }

  const isEventFinished = new Date(event.event_date) < new Date();

  return (
    <div className="bg-charcoal min-h-screen text-white p-6 md:p-10">
      {/* EVENT */}
      <img
        src={event.image_url || "https://via.placeholder.com/500"}
        className="w-full h-64 object-cover rounded-2xl"
      />

      <h1 className="font-headline text-3xl mt-6">{event.title}</h1>
      <p className="opacity-70">{event.location}</p>

      <p className="mt-4">{event.description}</p>

      {/* PRICE */}
      <p className="mt-4 text-soft-pink font-bold text-lg">
        {event.is_free
          ? "FREE"
          : `Rp ${event.price?.toLocaleString("id-ID") || "-"}`}
      </p>

      {/* BUY BUTTON */}
      {!event.is_free && (
        <button
          onClick={() => setOpen(true)}
          className="stage-gradient mt-6 px-6 py-3 rounded-xl font-semibold"
        >
          Buy Ticket
        </button>
      )}

      {/* ==========================
          MODAL BUY
      ========================== */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-gray p-6 rounded-2xl w-full max-w-md">
            <h2 className="font-headline text-xl mb-4">Buy Ticket</h2>

            <p className="mb-2">Quantity</p>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-2 rounded bg-charcoal mb-4"
            />

            <p className="mb-2">Promo Code</p>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter voucher"
              className="w-full p-2 rounded bg-charcoal mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleBuy}
                disabled={loadingBuy}
                className="stage-gradient px-4 py-2 rounded font-semibold"
              >
                {loadingBuy ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================
          REVIEW FORM
      ========================== */}
      {isEventFinished && (
        <div className="mt-10 bg-dark-gray p-6 rounded-2xl">
          <h2 className="font-headline text-xl mb-4">Leave a Review</h2>

          <label className="block mb-2">Rating (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full p-2 rounded bg-charcoal mb-4"
          />

          <label className="block mb-2">Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 rounded bg-charcoal mb-4"
          />

          <label className="block mb-2">Suggestions</label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full p-2 rounded bg-charcoal mb-4"
          />

          <button
            onClick={handleSubmitReview}
            disabled={loadingReview}
            className="stage-gradient px-6 py-3 rounded-xl font-semibold"
          >
            {loadingReview ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* ==========================
          REVIEW LIST
      ========================== */}
      <div className="mt-10">
        <h2 className="font-headline text-xl mb-4">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="opacity-70">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-dark-gray p-4 rounded-xl">
                <p className="text-soft-pink font-bold">⭐ {review.rating}/5</p>

                <p className="mt-2">{review.feedback}</p>

                {review.suggestions && (
                  <p className="mt-2 text-sm opacity-70">
                    💡 {review.suggestions}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
