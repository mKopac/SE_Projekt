import React from 'react';
import type { Practice } from './Dashboard';

interface Props {
  practices: Practice[];
}

const PracticeTable: React.FC<Props> = ({ practices }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Študent</th>
          <th>Firma</th>
          <th>Od</th>
          <th>Do</th>
          <th>Popis</th>
        </tr>
      </thead>
      <tbody>
        {practices.map(p => (
          <tr key={p.id}>
            <td>{p.studentName}</td>
            <td>{p.company}</td>
            <td>{p.startDate}</td>
            <td>{p.endDate}</td>
            <td>{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PracticeTable;
