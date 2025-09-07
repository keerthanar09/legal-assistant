export default function Sidebar({ onSelect }) {
  const items = ["Defined", "Heatmap", "Negotiation Tips", "Summarized"];

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, idx) => (
        <button
          key={idx}
          className="bg-softGreen p-3 rounded-xl hover:shadow-lg shadow-green-300 transition"
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
