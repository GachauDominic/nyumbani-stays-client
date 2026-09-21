import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  key: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, actions }: DataTableProps<T>) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {actions && <th className="actions-col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(row)}</td>
              ))}
              {actions && <td className="actions-col">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
