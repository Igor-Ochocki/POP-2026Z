import './TableCell.css';

interface TableCellProps {
  children: React.ReactNode;
}

export default function TableCell({ children }: TableCellProps) {
  return (
    <td
      className={`table-cell ${typeof children === 'number' ? 'table-cell--number' : ''}`}
    >
      {children}
    </td>
  );
}
