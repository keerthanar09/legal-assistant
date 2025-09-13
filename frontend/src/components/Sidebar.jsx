export default function Sidebar() {
  const items = [
    { name: "Defined", link: "/defined" },
    { name: "Heatmap", link: "/heatmap" },
    { name: "Negotiation Tips", link: "/negotiation-tips" },
    { name: "Summarized", link: "/summary" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.link}
          className="bg-softGreen p-3 rounded-xl hover:shadow-lg shadow-green-300 transition text-center"
        >
          {item.name}
        </a>
      ))}
    </div>
  );
}
