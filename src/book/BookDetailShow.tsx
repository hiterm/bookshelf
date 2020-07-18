/** @jsx jsx */
import React from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { createMuiTheme } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import Button from '@material-ui/core/Button';
import { css, jsx } from '@emotion/core';
import { db } from '../Firebase';
import { Book } from './schema';
import dayjs from 'dayjs';

const theme = createMuiTheme();

const BookDetailShowItem: React.FC<{
  field: string;
  value: React.ReactNode;
}> = (props) => {
  return (
    <ListItemText
      primary={
        <React.Fragment>
          <Box display="inline-block" width={100} fontWeight="fontWeightBold">
            {props.field}
          </Box>
          <span>{props.value}</span>
        </React.Fragment>
      }
    />
  );
};

const ShowBoolean: React.FC<{ flag: boolean }> = (props) => (
  <Check
    css={css`
    color: ${
      props.flag ? theme.palette.success.main : theme.palette.action.disabled
    };}
    `}
  />
);

export const BookDetailShow: React.FC<{ book: Book | undefined }> = (props) => {
  const { url } = useRouteMatch();

  const book = props.book;

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

  const handleDelete = () => {
    db.collection('books')
      .doc(book.id)
      .delete()
      .then(() => {
        console.log('Book successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing book: ', error);
      });
  };

  return (
    <React.Fragment>
      <div>
        <Paper css={{ display: 'inline-block' }}>
          <List>
            <ListItem>
              <BookDetailShowItem field="書名" value={book.title} />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="著者"
                value={book.authors.join(', ')}
              />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem field="形式" value={book.format} />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem field="ストア" value={book.store} />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="優先度"
                value={book.priority.toString()}
              />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="既読"
                value={<ShowBoolean flag={book.read} />}
              />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="所有"
                value={<ShowBoolean flag={book.owned} />}
              />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem field="ISBN" value={book.isbn} />
            </ListItem>
            <ListItem>
              <BookDetailShowItem
                field="作成日時"
                value={dayjs(book.createdAt).format('YYYY/MM/DD HH:mm:ss')}
              />
            </ListItem>
            <Divider light variant="middle" />
            <ListItem>
              <BookDetailShowItem
                field="更新日時"
                value={dayjs(book.updatedAt).format('YYYY/MM/DD HH:mm:ss')}
              />
            </ListItem>
          </List>
        </Paper>
      </div>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`${url}/edit`}
      >
        変更
      </Button>
      <Button variant="contained" color="secondary" onClick={handleDelete}>
        削除
      </Button>
    </React.Fragment>
  );
};
