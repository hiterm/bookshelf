import { Box, Button, Center, Group, Modal, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconArrowBack } from "@tabler/icons";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { ShowBoolean } from "../../compoments/utils/ShowBoolean";
import { useDeleteBookMutation } from "../../generated/graphql";
import { Book } from "./entity/Book";
import { displayBookFormat } from "./entity/BookFormat";
import { displayBookStore } from "./entity/BookStore";

const BookDetailShowItem: React.FC<{
  field: string;
  value: React.ReactNode;
  halfWidth?: boolean;
}> = ({ field, value, halfWidth }) => {
  return (
    <>
      <Text weight="bold">{field}</Text>
      <Group
        align="center"
        sx={{
          gridColumn: halfWidth ? "span 1" : "2 / -1",
        }}
      >
        {value}
      </Group>
    </>
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
        message: `削除に失敗しました: ${String(error)}`,
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
  const history = useHistory();

  const book = props.book;

  return (
    <React.Fragment>
      <Button
        onClick={() => {
          history.goBack();
        }}
        leftIcon={<IconArrowBack />}
        variant="outline"
        m={20}
      >
        Back
      </Button>
      <Box
        sx={theme => ({
          display: "grid",
          rowGap: 20,
          columnGap: 20,
          margin: 20,
          [theme.fn.smallerThan("sm")]: {
            gridTemplateColumns: "max-content 1fr",
          },
          [theme.fn.largerThan("sm")]: {
            gridTemplateColumns: "max-content 1fr max-content 1fr",
          },
        })}
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
      <Group m={20}>
        <Button color="blue" component={Link} to={`${url}/edit`}>
          変更
        </Button>
        <DeleteButton book={book} />
      </Group>
    </React.Fragment>
  );
};
