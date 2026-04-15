export default function Pagination({ page, setPage }: any) {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-dark-gray rounded-lg"
      >
        Prev
      </button>

      <span>Page {page}</span>

      <button
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-dark-gray rounded-lg"
      >
        Next
      </button>
    </div>
  );
}
