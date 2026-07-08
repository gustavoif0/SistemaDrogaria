import type { ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ items, activeId, onChange }: TabsProps) {
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {items.map((item) => {
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              className={[
                "h-10 rounded-t-md border border-b-0 px-4 text-sm font-semibold transition",
                selected
                  ? "border-slate-200 bg-white text-pharma-700"
                  : "border-transparent bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              ].join(" ")}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="rounded-b-md border border-t-0 border-slate-200 bg-white p-5">{active.content}</div>
    </div>
  );
}
