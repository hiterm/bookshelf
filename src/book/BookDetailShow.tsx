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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';

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

const DeleteButton: React.FC<{ book: Book }> = ({ book }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
    <div>
      <Button variant="contained" color="secondary" onClick={handleClickOpen}>
        削除
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">削除確認</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {book.title}を削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export const BookDetailShow: React.FC<{ book: Book | undefined }> = (props) => {
  const { url } = useRouteMatch();

  const book = props.book;

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

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
      <DeleteButton book={book} />
    </React.Fragment>
  );
};
