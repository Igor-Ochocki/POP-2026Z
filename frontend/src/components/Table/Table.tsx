import './Table.css';
import TableHeader from '@components/TableHeader/TableHeader';
import TableRow from '@components/TableRow/TableRow';

interface TableProps {
  headerLabels: string[];
  values: any[][];
  equalWidth?: boolean;
}

export default function Table({
  headerLabels,
  values,
  equalWidth,
}: TableProps) {
  if (values.some((v) => v.length !== headerLabels.length)) {
    throw new Error('invalid table');
  }

  return (
    <table className='table'>
      <thead>
        <TableHeader labels={headerLabels} equalWidth={equalWidth} />
      </thead>
      <tbody>
        {values.map((v, i) => (
          <TableRow key={i} values={v} />
        ))}
      </tbody>
    </table>
  );
}
