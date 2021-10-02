import { css } from '@emotion/react';
import Check from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { db } from '../../Firebase';
import { Book } from './schema';

const theme = createTheme();

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

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const handleDelete = async () => {
    try {
      await db.collection('books').doc(book.id).delete();
      history.push('/books');
      enqueueSnackbar(`${book.title}が削除されました`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(`削除に失敗しました: ${error}`, { variant: 'error' });
    }
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

export const BookDetailShow: React.FC<{ book: Book }> = (props) => {
  const { url } = useRouteMatch();

  const book = props.book;

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
