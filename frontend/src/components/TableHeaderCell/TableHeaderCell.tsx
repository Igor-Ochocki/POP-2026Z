import './TableHeaderCell.css';

interface TableHeaderCellProps {
  children: React.ReactNode;
  width?: string;
}

export default function TableHeaderCell({
  children,
  width,
}: TableHeaderCellProps) {
  return (
    <th className='table-header-cell' style={{ width }}>
      {children}
    </th>
  );
}
