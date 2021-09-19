import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

export type BookImportType = { title: string; author: string; date: string };

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(
  title: string,
  author: string,
  date: string
): BookImportType {
  return { title, author, date };
}

const rows = [
  createData('Frozen yoghurt', 'a', 'a'),
  createData('Ice cream sandwich', 'a', 'a'),
];

type BookImportProps = { books: BookImportType[] };

export const BookImportConfirmPage: React.FC<BookImportProps> = ({ books }) => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>タイトル</TableCell>
            <TableCell align="right">著者</TableCell>
            <TableCell align="right">日付</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((row) => (
            <TableRow key={row.title}>
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell align="right">{row.author}</TableCell>
              <TableCell align="right">{row.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
