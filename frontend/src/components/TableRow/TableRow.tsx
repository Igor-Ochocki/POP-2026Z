import TableCell from '@components/TableCell/TableCell';

interface TableRowProps {
  values: any[];
}

export default function TableRow({ values }: TableRowProps) {
  return (
    <tr>
      {values.map((v, i) => (
        <TableCell key={i}>{v}</TableCell>
      ))}
    </tr>
  );
}
