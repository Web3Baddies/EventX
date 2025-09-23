interface StatItem {
  label: string;
  value: string;
  sublabel?: string;
}

interface StatRowProps {
  items: StatItem[];
}

export default function StatRow({ items }: StatRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{it.value}</div>
          <div className="text-sm text-gray-500 mt-1">{it.label}</div>
          {it.sublabel && <div className="text-xs text-gray-400 mt-0.5">{it.sublabel}</div>}
        </div>
      ))}
    </div>
  );
}
