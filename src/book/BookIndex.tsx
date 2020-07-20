/** @jsx jsx */
import React from 'react';
import { Formik, Field, FieldArray, Form } from 'formik';
import { TextField as FormikTextField } from 'formik-material-ui';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { firebase, db } from '../Firebase';
import { Book, bookFormSchema } from './schema';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import {
  useTable,
  Column,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
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
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import dayjs from 'dayjs';
import { createMuiTheme } from '@material-ui/core/styles';
import { jsx } from '@emotion/core';
import { useSnackbar } from 'notistack';
import MuiLink from '@material-ui/core/Link';

const theme = createMuiTheme();

const GreenCheck: React.FC<{}> = () => (
  <Check css={{ color: theme.palette.success.main }} />
);

const BookList: React.FC<{ list: Book[] }> = (props) => {
  const data: Book[] = React.useMemo(() => props.list, [props.list]);
  const columns: Column<Book>[] = React.useMemo(
    () => [
      {
        Header: '書名',
        accessor: 'title',
        Cell: ({ value, row }) => (
          <MuiLink component={RouterLink} to={`/books/${row.original.id}`}>
            {value}
          </MuiLink>
        ),
      },
      { Header: '著者', accessor: 'authors' },
      { Header: '形式', accessor: 'format' },
      { Header: '優先度', accessor: 'priority' },
      {
        Header: '追加日時',
        accessor: (book: Book) =>
          dayjs(book.createdAt).format('YYYY/MM/DD HH:mm:ss'),
        id: 'createdAt',
      },
      {
        Header: '更新日時',
        accessor: (book: Book) =>
          dayjs(book.updatedAt).format('YYYY/MM/DD HH:mm:ss'),
        id: 'updatedAt',
      },
      {
        Header: '既読',
        accessor: 'read',
        Cell: ({ value }) => (value ? <GreenCheck /> : ''),
      },
      {
        Header: '所有',
        accessor: 'owned',
        Cell: ({ value }) => (value ? <GreenCheck /> : ''),
      },
    ],
    []
  );

  const getId = (column: Column<Book>): string => {
    if (typeof column.id === 'string') {
      return column.id;
    } else if (typeof column.accessor === 'string') {
      return column.accessor;
    } else {
      console.error(`${JSON.stringify(column)} has no id.`);
      return '';
    }
  };

  const table = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 20,
        sortBy: [
          {
            id: 'priority',
            desc: true,
          },
        ],
        hiddenColumns: columns
          .filter(
            (column) =>
              !['title', 'authors', 'priority'].includes(getId(column))
          )
          .map((column) => getId(column)),
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <Checkbox color="primary" {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }: any) => (
            <div>
              <Checkbox color="primary" {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

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
    selectedFlatRows,
    state: { pageIndex, pageSize, globalFilter },
  } = table;

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
      <Button
        onClick={() =>
          console.log(
            JSON.stringify(selectedFlatRows.map((row) => row.original))
          )
        }
      >
        log
      </Button>
      <div>
        <FormGroup row>
          {allColumns
            .filter((column) => column.id !== 'selection')
            .map((column) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...column.getToggleHiddenProps()}
                    color="primary"
                  />
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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const history = useHistory();

  const handleSubmit = async (values: any) => {
    const doc = await db.collection('books').add({
      title: values.title,
      authors: values.authors,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const action = (key: string) => (
      <React.Fragment>
        <Button
          onClick={() => {
            history.push(`/books/${doc.id}`);
            closeSnackbar(key);
          }}
        >
          Move
        </Button>
        <Button
          onClick={() => {
            closeSnackbar(key);
          }}
        >
          <Close />
        </Button>
      </React.Fragment>
    );

    const message = `${values.title}を追加しました`;
    enqueueSnackbar(message, {
      variant: 'success',
      action,
    });
  };
  return (
    <Formik
      initialValues={{ title: '', authors: [''] }}
      validationSchema={bookFormSchema}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
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

const BookIndex: React.FC<{ books: Book[] }> = (props) => {
  return (
    <React.Fragment>
      <h2>追加</h2>
      <BookAddForm />
      <h2>一覧</h2>
      <BookList list={props.books} />
    </React.Fragment>
  );
};

export { BookIndex };
