import MaterialTable, { Column, Icons } from '@material-table/core';
import React from 'react';
import { Book } from './schema';

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import MuiLink from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';

const tableIcons: Icons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

export const BookList: React.FC<{ list: Book[] }> = (props) => {
  const columns: Column<Book>[] = [
    {
      title: '書名',
      field: 'title',
      cellStyle: { minWidth: '200px' },
      render: (rowData) => (
        <MuiLink component={RouterLink} to={`/books/${rowData.id}`}>
          {rowData.title}
        </MuiLink>
      ),
    },
    { title: '著者', field: 'authors', cellStyle: { minWidth: '150px' } },
    {
      title: '形式',
      field: 'format',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    {
      title: 'ストア',
      field: 'store',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    { title: '優先度', field: 'priority', defaultSort: 'desc' },
    {
      title: '既読',
      field: 'read',
      type: 'boolean',
      defaultFilter: 'unchecked',
    },
    {
      title: '所有',
      field: 'owned',
      type: 'boolean',
      hidden: true,
      hiddenByColumnsButton: true,
      defaultFilter: 'checked',
    },
    {
      title: '追加日時',
      field: 'createdAt',
      type: 'datetime',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    {
      title: '更新日時',
      field: 'updatedAt',
      type: 'datetime',
      hidden: true,
      hiddenByColumnsButton: true,
    },
  ];

  return (
    <MaterialTable
      columns={columns}
      data={props.list}
      title=""
      options={{
        filtering: true,
        columnsButton: true,
        pageSize: 20,
        pageSizeOptions: [20, 50, 100, 500, 1000],
      }}
      icons={tableIcons}
    />
  );
};
