import { useNavigate } from "react-router-dom";

export default function EventCard({ event }: any) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-dark-gray rounded-xl p-4 cursor-pointer hover:scale-105 transition"
    >
      <img
        src={event.image_url || "https://via.placeholder.com/300"}
        className="rounded-lg mb-3 h-40 w-full object-cover"
      />

      <h2 className="font-headline text-lg">{event.title}</h2>
      <p className="text-sm opacity-70">{event.location}</p>

      <p className="mt-2 font-semibold">
        {event.is_free ? "FREE" : "Paid Event"}
      </p>
    </div>
  );
}
