import { Box, Button, Center, Modal, Text, ThemeIcon, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { useDeleteBookMutation } from "../../generated/graphql";
import { Book, displayBookFormat, displayBookStore } from "./schema";

const BookDetailShowItem: React.FC<{
  field: string;
  value: React.ReactNode;
  halfWidth?: boolean;
}> = (props) => {
  const valueForShow = props.value == null || props.value === "" ? "-" : props.value;
  const gridColumnEnd = props.halfWidth ? "span 1" : undefined;

  return (
    <>
      <Text sx={{ fontWeight: "bold", justifySelf: "end" }}>{props.field}</Text>
      <Box
        sx={(theme) => ({
          [theme.fn.smallerThan("sm")]: {
            gridColumnEnd: "span 3",
          },
          [theme.fn.largerThan("sm")]: {
            gridColumnEnd: gridColumnEnd,
          },
        })}
      >
        {valueForShow}
      </Box>
    </>
  );
};

const ShowBoolean: React.FC<{ flag: boolean }> = ({ flag }) => {
  return flag
    ? (
      <ThemeIcon size="sm" color="green">
        <IconCheck />
      </ThemeIcon>
    )
    : (
      <ThemeIcon size="sm" color="grey">
        <IconX />
      </ThemeIcon>
    );
};

const DeleteButton: React.FC<{ book: Book }> = ({ book }) => {
  const [open, setOpen] = useState(false);

  const [_deleteBookResult, deleteBook] = useDeleteBookMutation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const history = useHistory();
  const handleDelete = async () => {
    try {
      await deleteBook({ bookId: book.id }, { additionalTypenames: ["Book"] });
      history.push("/books");
      showNotification({
        message: `${book.title}が削除されました`,
        color: "teal",
      });
    } catch (error) {
      showNotification({
        message: `削除に失敗しました: ${error}`,
        color: "red",
      });
    }
  };

  return (
    <div>
      <Button color="red" onClick={handleClickOpen}>
        削除
      </Button>
      <Modal
        opened={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Title order={3} id="alert-dialog-title">
          削除確認
        </Title>
        <Box>{book.title}を削除しますか？</Box>
        <Center>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleDelete} color="red" autoFocus>
            削除する
          </Button>
        </Center>
      </Modal>
    </div>
  );
};

export const BookDetailShow: React.FC<{ book: Book }> = (props) => {
  const { url } = useRouteMatch();

  const book = props.book;

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr max-content 1fr",
          rowGap: 20,
          columnGap: 20,
          padding: 20,
        }}
      >
        <BookDetailShowItem field="書名" value={book.title} />
        <BookDetailShowItem
          field="著者"
          value={book.authors.map((author) => author.name).join(", ")}
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
          value={dayjs(book.createdAt).format("YYYY/MM/DD HH:mm:ss")}
          halfWidth
        />
        <BookDetailShowItem
          field="更新日時"
          value={dayjs(book.updatedAt).format("YYYY/MM/DD HH:mm:ss")}
          halfWidth
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1, marginTop: 1, marginBottom: 1 }}>
        <Button color="blue" component={Link} to={`${url}/edit`}>
          変更
        </Button>
        <DeleteButton book={book} />
      </Box>
    </React.Fragment>
  );
};
