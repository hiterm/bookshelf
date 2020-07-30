/** @jsx jsx */
import React, { useState } from 'react';
import { Formik, Field, FieldArray, Form } from 'formik';
import {
  TextField as FormikTextField,
  Select as FormikSelect,
  CheckboxWithLabel,
} from 'formik-material-ui';
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
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useFilters,
  Column,
  CellProps,
  FilterProps,
  HeaderProps,
  ColumnInstance,
  Filters,
  SortingRule,
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
import FilterListIcon from '@material-ui/icons/FilterList';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import dayjs from 'dayjs';
import { createMuiTheme } from '@material-ui/core/styles';
import { jsx } from '@emotion/core';
import { useSnackbar } from 'notistack';
import MuiLink from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const theme = createMuiTheme();

const GreenCheck: React.FC<{}> = () => (
  <Check css={{ color: theme.palette.success.main }} />
);

type BulkChangeFormProps = {
  read: {
    enable: boolean;
    value: '' | 'true' | 'false';
  };
  owned: {
    enable: boolean;
    value: '' | 'true' | 'false';
  };
};

const parseStrBoolean = (str: '' | 'true' | 'false') => {
  let value = true;
  switch (str) {
    case 'true':
      value = true;
      break;
    case 'false':
      value = false;
      break;
    default:
      throw new Error(`value cannot be parsed as boolean: ${str}`);
  }
  return value;
};

const BulkChangeDialog: React.FC<{ selectedBooks: Book[] }> = ({
  selectedBooks,
}) => {
  const [open, setOpen] = useState(false);

  // const bulkChangeFormSchema = yup.object.shape({
  // })

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const { enqueueSnackbar } = useSnackbar();

  // TODO: 500件より多いとき
  const handleUpdate = async (values: BulkChangeFormProps) => {
    let bookProps: { read?: boolean; owned?: boolean } = {};
    if (values.read.enable) {
      bookProps.read = parseStrBoolean(values.read.value);
    }
    if (values.owned.enable) {
      bookProps.owned = parseStrBoolean(values.owned.value);
    }

    const batch = db.batch();
    for (let i = 0; i < selectedBooks.length; i++) {
      const book = selectedBooks[i];

      var bookRef = db.collection('books').doc(book.id);
      batch.update(bookRef, bookProps);
    }
    try {
      await batch.commit();
      enqueueSnackbar('更新に成功しました', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(`更新に失敗しました: ${error}`, { variant: 'error' });
    }
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpenClick}
      >
        一括更新
      </Button>
      <Formik
        initialValues={{
          read: { enable: false, value: '' },
          owned: { enable: false, value: '' },
        }}
        onSubmit={handleUpdate}
      >
        {({ handleSubmit }) => (
          <Dialog open={open}>
            <DialogTitle>一括更新</DialogTitle>
            <DialogContent>
              <DialogContentText>
                選択した項目を一括更新します。
              </DialogContentText>
              <Form>
                <div>
                  <Field
                    component={CheckboxWithLabel}
                    color="primary"
                    name="read.enable"
                    type="checkbox"
                    Label={{ label: '既読' }}
                  />
                  <Field component={FormikSelect} name="read.value">
                    <MenuItem value={''}></MenuItem>
                    <MenuItem value={'true'}>既読</MenuItem>
                    <MenuItem value={'false'}>未読</MenuItem>
                  </Field>
                </div>
                <div>
                  <Field
                    component={CheckboxWithLabel}
                    color="primary"
                    name="owned.enable"
                    type="checkbox"
                    Label={{ label: '所有' }}
                  />
                  <Field component={FormikSelect} name="owned.value">
                    <MenuItem value={''}></MenuItem>
                    <MenuItem value={'true'}>所有</MenuItem>
                    <MenuItem value={'false'}>未所有</MenuItem>
                  </Field>
                </div>
              </Form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogCloseClick} color="primary">
                キャンセル
              </Button>
              <Button onClick={() => handleSubmit()} color="primary">
                反映
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Formik>
    </div>
  );
};

const DefaultColumnFilter = ({
  column: { filterValue, preFilteredRows, setFilter },
}: FilterProps<Book>) => {
  const count = preFilteredRows.length;

  return (
    <TextField
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FilterListIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

const SelectColumnFilter = ({
  column: { filterValue, setFilter, preFilteredRows, id },
}: FilterProps<Book>) => {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options: string[] = React.useMemo(() => {
    const options = new Set<string>();
    preFilteredRows.forEach((row) => {
      if (row !== null) {
        options.add(row.values[id]);
      }
    });
    return Array.from(options);
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <Select
      value={filterValue}
      defaultValue=""
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      startAdornment={
        <InputAdornment position="start">
          <FilterListIcon />
        </InputAdornment>
      }
    >
      <MenuItem value="">All</MenuItem>
      {options.map((option, i) => (
        <MenuItem key={i} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};

const ReadFilter = ({
  column: { filterValue, setFilter },
}: FilterProps<Book>) => {
  const handleChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    const valueString = e.target.value as '' | 'true' | 'false';
    let value = undefined;
    switch (valueString) {
      case '':
        value = undefined;
        break;
      case 'true':
        value = true;
        break;
      case 'false':
        value = false;
        break;
    }
    setFilter(value);
  };

  return (
    <Select
      value={filterValue}
      defaultValue=""
      onChange={handleChange}
      startAdornment={
        <InputAdornment position="start">
          <FilterListIcon />
        </InputAdornment>
      }
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="true">既読</MenuItem>
      <MenuItem value="false">未読</MenuItem>
    </Select>
  );
};

const OwnedFilter = ({
  column: { filterValue, setFilter },
}: FilterProps<Book>) => {
  const handleChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    const valueString = e.target.value as '' | 'true' | 'false';
    let value = undefined;
    switch (valueString) {
      case '':
        value = undefined;
        break;
      case 'true':
        value = true;
        break;
      case 'false':
        value = false;
        break;
    }
    setFilter(value);
  };

  return (
    <Select
      value={filterValue}
      defaultValue=""
      onChange={handleChange}
      startAdornment={
        <InputAdornment position="start">
          <FilterListIcon />
        </InputAdornment>
      }
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="true">所有</MenuItem>
      <MenuItem value="false">未所有</MenuItem>
    </Select>
  );
};

const BookList: React.FC<{ list: Book[] }> = (props) => {
  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

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
      {
        Header: '形式',
        accessor: 'format',
        Filter: SelectColumnFilter,
      },
      { Header: '優先度', accessor: 'priority' },
      {
        Header: '既読',
        accessor: 'read',
        Cell: ({ value }) => (value ? <GreenCheck /> : ''),
        Filter: ReadFilter,
        filter: 'equals',
      },
      {
        Header: '所有',
        accessor: 'owned',
        Cell: ({ value }) => (value ? <GreenCheck /> : ''),
        Filter: OwnedFilter,
        filter: 'equals',
      },
      {
        Header: '追加日時',
        accessor: (book: Book) =>
          dayjs(book.createdAt).format('YYYY/MM/DD HH:mm:ss'),
        id: 'createdAt',
        disableFilters: true,
      },
      {
        Header: '更新日時',
        accessor: (book: Book) =>
          dayjs(book.updatedAt).format('YYYY/MM/DD HH:mm:ss'),
        id: 'updatedAt',
        disableFilters: true,
      },
    ],
    []
  );

  const initialFilters: Filters<Book> = React.useMemo(
    () => [
      {
        id: 'read',
        value: false,
      },
    ],
    []
  );
  const initialSortBy: SortingRule<Book>[] = React.useMemo(
    () => [
      {
        id: 'priority',
        desc: true,
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
      defaultColumn,
      initialState: {
        pageSize: 20,
        filters: initialFilters,
        sortBy: initialSortBy,
        hiddenColumns: columns
          .filter(
            (column) =>
              !['title', 'authors', 'priority'].includes(getId(column))
          )
          .map((column) => getId(column)),
      },
    },
    useFilters,
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
          Header: ({ getToggleAllRowsSelectedProps }: HeaderProps<Book>) => (
            <div>
              <Checkbox color="primary" {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }: CellProps<Book>) => (
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
    visibleColumns,
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
      <BulkChangeDialog
        selectedBooks={selectedFlatRows.map((row) => row.original)}
      />
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
            <TableRow>
              {visibleColumns.map((column: ColumnInstance<Book>) => (
                <TableCell key={column.id}>
                  {column.canFilter ? column.render('Filter') : null}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} hover>
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
