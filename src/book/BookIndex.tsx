import React, { useState, useEffect } from 'react';
import { Formik, Field, FieldArray, Form } from 'formik';
import { TextField as FormikTextField } from 'formik-material-ui';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { firebase, db } from '../Firebase';
import { Book, bookFormSchema, firebaseDocToBook } from './schema';
import { useHistory } from 'react-router-dom';
import {
  useTable,
  Column,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Search from '@material-ui/icons/Search';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

const BookList: React.FC<{ list: Book[] }> = (props) => {
  const data: Book[] = React.useMemo(() => props.list, [props.list]);
  const columns: Column<Book>[] = React.useMemo(
    () => [
      { Header: '書名', accessor: 'title' },
      { Header: '著者', accessor: 'authors' },
      { Header: '形式', accessor: 'format' },
      { Header: '優先度', accessor: 'priority' },
    ],
    []
  );

  const history = useHistory();
  const handleRowClick = (id: string) => (
    _event: React.MouseEvent<Element, MouseEvent> | undefined
  ) => {
    history.push(`/books/${id}`);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    gotoPage,
    setPageSize,
    allColumns,
    prepareRow,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    { columns, data, initialState: { pageSize: 20 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPageSize(Number(event.target.value));
  };

  return (
    <React.Fragment>
      <div>
        <FormGroup row>
          {allColumns.map((column) => (
            <FormControlLabel
              control={
                <Checkbox {...column.getToggleHiddenProps()} color="primary" />
              }
              label={column.Header}
              key={column.id}
            />
          ))}
          <TextField
            value={globalFilter || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
          />
        </FormGroup>
      </div>
      <TableContainer component={Paper}>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render('Header')}
                    {column.id !== 'selection' ? (
                      <TableSortLabel
                        active={column.isSorted}
                        // react-table has a unsorted state which is not treated here
                        direction={column.isSortedDesc ? 'desc' : 'asc'}
                      />
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <TableRow
                  {...row.getRowProps()}
                  onClick={handleRowClick(row.original.id)}
                  style={{ cursor: 'pointer' }}
                  hover
                >
                  {row.cells.map((cell) => {
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[
                  10,
                  20,
                  50,
                  { label: 'All', value: data.length },
                ]}
                colSpan={3}
                count={data.length}
                rowsPerPage={pageSize}
                page={pageIndex}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

const BookAddForm: React.FC<{}> = () => {
  const handleSubmit = (values: any) => {
    return db.collection('books').add({
      title: values.title,
      authors: values.authors,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };
  return (
    <Formik
      initialValues={{ title: '', authors: [''] }}
      validationSchema={bookFormSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors }) => (
        <Form>
          <Field
            component={FormikTextField}
            name="title"
            label="タイトル"
            InputLabelProps={{ shrink: true }}
          />
          <InputLabel shrink={true}>著者</InputLabel>
          <FieldArray
            name="authors"
            render={(arrayHelpers) => (
              <div>
                {values.authors.map((_author: string, index: number) => (
                  <div key={index}>
                    <Field
                      component={FormikTextField}
                      name={`authors.${index}`}
                    />
                    <Button
                      variant="contained"
                      type="button"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  variant="contained"
                  type="button"
                  onClick={() => arrayHelpers.push('')}
                >
                  著者追加
                </Button>
              </div>
            )}
          />
          <Button variant="contained" color="primary" type="submit">
            Add
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const BookIndex: React.FC<{}> = () => {
  const [list, setList] = useState([] as Book[]);
  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map(firebaseDocToBook);
      const compare = (a: Book, b: Book) => {
        return b.priority - a.priority;
      };
      list.sort(compare);
      // debug
      // castedList.forEach((book) => console.log(JSON.stringify(book)));
      setList(list);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <React.Fragment>
      <h2>追加</h2>
      <BookAddForm />
      <h2>一覧</h2>
      <BookList list={list} />
    </React.Fragment>
  );
};

export { BookIndex };
