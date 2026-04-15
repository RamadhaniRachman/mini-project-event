import { useState } from "react";

export default function BuyTicketModal({ event, onClose }: any) {
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");

  const handleBuy = () => {
    fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: event.id,
        quantity,
        coupon_code: coupon,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Transaction success!");
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[var(--color-dark-gray)] p-6 rounded-2xl w-full max-w-md">
        <h2 className="font-headline text-xl mb-4">Buy Ticket</h2>

        <p className="mb-2">Quantity</p>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 rounded bg-[var(--color-charcoal)] mb-4"
        />

        <p className="mb-2">Promo Code</p>
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter voucher"
          className="w-full p-2 rounded bg-[var(--color-charcoal)] mb-4"
        />

        <div className="flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600">
            Cancel
          </button>

          <button
            onClick={handleBuy}
            className="px-4 py-2 rounded stage-gradient font-semibold"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
