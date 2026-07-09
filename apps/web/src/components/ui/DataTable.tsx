import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  isRowSelected?: (row: T) => boolean;
  onRowClick?: (row: T, position: { x: number; y: number }) => void;
}

const alignments = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "Nenhum registro encontrado.",
  isRowSelected,
  onRowClick,
}: DataTableProps<T>) {
  function getKeyboardPosition(event: KeyboardEvent<HTMLTableRowElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: rect.left + 24, y: rect.top + rect.height / 2 };
  }

  function getMousePosition(event: MouseEvent<HTMLTableRowElement>) {
    return { x: event.clientX, y: event.clientY };
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="max-h-[560px] overflow-auto erp-scrollbar">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={[
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500",
                    alignments[column.align ?? "left"],
                    column.className ?? "",
                  ].join(" ")}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row) => {
              const rowKey = getRowKey(row);
              const selected = Boolean(isRowSelected?.(row));

              return (
                <tr
                  key={rowKey}
                  className={[
                    onRowClick ? "cursor-pointer select-none outline-none" : "",
                    selected
                      ? "bg-pharma-50 ring-1 ring-inset ring-pharma-200"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                  onClick={(event) => onRowClick?.(row, getMousePosition(event))}
                  onKeyDown={(event) => {
                    if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) return;

                    event.preventDefault();
                    onRowClick(row, getKeyboardPosition(event));
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={[
                        "px-4 py-3 align-middle text-slate-700",
                        alignments[column.align ?? "left"],
                        column.className ?? "",
                      ].join(" ")}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {!data.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
