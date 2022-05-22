import Check from '@mui/icons-material/Check';
import { Paper, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { db } from '../../Firebase';
import { Book, displayBookFormat, displayBookStore } from './schema';

const theme = createTheme();

const BookDetailShowItem: React.FC<{
  field: string;
  value: React.ReactNode;
  halfWidth?: boolean;
}> = (props) => {
  const valueForShow =
    props.value == null || props.value === '' ? '-' : props.value;
  const gridColumnEnd = props.halfWidth ? 'span 1' : undefined;

  return (
    <>
      <Typography
        variant="body1"
        sx={{ fontWeight: 'bold', justifySelf: 'end' }}
      >
        {props.field}
      </Typography>
      <Box sx={{ gridColumnEnd: { xs: 'span 3', md: gridColumnEnd } }}>
        {valueForShow}
      </Box>
    </>
  );
};

const ShowBoolean: React.FC<{ flag: boolean }> = (props) => (
  <Check
    sx={{
      color: props.flag
        ? theme.palette.success.main
        : theme.palette.action.disabled,
    }}
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
      <Button variant="contained" color="error" onClick={handleClickOpen}>
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
      <Paper
        sx={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr max-content 1fr',
          rowGap: 2,
          columnGap: 2,
          padding: 2,
        }}
      >
        <BookDetailShowItem field="書名" value={book.title} />
        <BookDetailShowItem
          field="著者"
          value={book.authors.map((author) => author.name).join(', ')}
        />
        <BookDetailShowItem
          field="形式"
          value={displayBookFormat(book.format)}
          halfWidth
        />
        <BookDetailShowItem
          field="ストア"
          value={displayBookStore(book.store)}
          halfWidth
        />
        <BookDetailShowItem field="優先度" value={book.priority.toString()} />
        <BookDetailShowItem
          field="既読"
          value={<ShowBoolean flag={book.read} />}
          halfWidth
        />
        <BookDetailShowItem
          field="所有"
          value={<ShowBoolean flag={book.owned} />}
          halfWidth
        />
        <BookDetailShowItem field="ISBN" value={book.isbn} />
        <BookDetailShowItem
          field="作成日時"
          value={dayjs(book.createdAt).format('YYYY/MM/DD HH:mm:ss')}
          halfWidth
        />
        <BookDetailShowItem
          field="更新日時"
          value={dayjs(book.updatedAt).format('YYYY/MM/DD HH:mm:ss')}
          halfWidth
        />
      </Paper>
      <Box sx={{ display: 'flex', gap: 1, marginTop: 1, marginBottom: 1 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`${url}/edit`}
        >
          変更
        </Button>
        <DeleteButton book={book} />
      </Box>
    </React.Fragment>
  );
};
