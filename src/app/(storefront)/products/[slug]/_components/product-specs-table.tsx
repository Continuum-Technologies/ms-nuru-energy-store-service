export interface ProductSpecRow {
  label: string;
  unit: string | null;
  value: string;
  displayOrder: number;
}

export interface ProductSpecsTableProps {
  specs: ProductSpecRow[];
}

/**
 * Renders structured specs as a real spec sheet — specs are structured data,
 * never free text (CLAUDE.md §4), so this is a table, not prose.
 */
export function ProductSpecsTable({ specs }: Readonly<ProductSpecsTableProps>) {
  if (specs.length === 0) return null;

  const sorted = [...specs].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80">
      <table className="w-full text-sm">
        <tbody>
          {sorted.map((spec, index) => (
            <tr key={spec.label} className={index % 2 === 0 ? "bg-surface" : "bg-surface-muted/40"}>
              <th scope="row" className="w-1/3 px-4 py-2.5 text-left font-semibold text-neutral-500">
                {spec.label}
              </th>
              <td className="px-4 py-2.5 text-foreground">
                {spec.value}
                {spec.unit ? ` ${spec.unit}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
