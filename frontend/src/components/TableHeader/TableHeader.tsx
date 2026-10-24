import TableHeaderCell from '@components/TableHeaderCell/TableHeaderCell';

interface TableHeaderProps {
  labels: string[];
  equalWidth?: boolean;
}
export default function TableHeader({ labels, equalWidth }: TableHeaderProps) {
  return (
    <tr>
      {labels.map((l, i) => (
        <TableHeaderCell
          key={i}
          width={equalWidth ? `${100 / labels.length}%` : undefined}
        >
          {l}
        </TableHeaderCell>
      ))}
    </tr>
  );
}
