export default function SearchBar({ value, onChange }: any) {
  return (
    <input
      type="text"
      placeholder="Search events..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded-xl bg-dark-gray text-white outline-none"
    />
  );
}
