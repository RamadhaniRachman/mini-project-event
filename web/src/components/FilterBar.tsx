export default function FilterBar({
  category,
  location,
  setCategory,
  setLocation,
}: any) {
  return (
    <div className="flex gap-4 mt-4">
      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 rounded-lg bg-dark-gray"
      />

      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="p-2 rounded-lg bg-dark-gray"
      />
    </div>
  );
}
