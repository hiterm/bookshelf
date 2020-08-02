/** @jsx jsx */
import { jsx } from '@emotion/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import InputAdornment from '@material-ui/core/InputAdornment';
import MuiLink from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { useTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import Check from '@material-ui/icons/Check';
import FilterListIcon from '@material-ui/icons/FilterList';
import Search from '@material-ui/icons/Search';
import dayjs from 'dayjs';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CellProps, Column, ColumnInstance, FilterProps, Filters, HeaderProps, SortingRule, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { BulkChangeButton } from './BulkChange';
import { Book } from './schema';

const GreenCheck: React.FC<{}> = () => {
  const theme = useTheme();

  return <Check css={{ color: theme.palette.success.main }} />;
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

export const BookList: React.FC<{ list: Book[] }> = (props) => {
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
      autoResetFilters: false,
      autoResetGlobalFilter: false,
      autoResetSortBy: false,
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
      <BulkChangeButton
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
