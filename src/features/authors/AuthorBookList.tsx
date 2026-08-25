import { Paper, Table, Text, Title } from "@mantine/core";
import React from "react";
import { Link } from "../../components/mantineTsr";
import { BooleanValue } from "../../components/utils/BooleanValue";
import type { AuthorQuery } from "../../generated/graphql-request";
import { displayBookFormat } from "../books/entity/BookFormat";

type Author = NonNullable<AuthorQuery["author"]>;

export const AuthorBookList: React.FC<{
  books: Author["books"];
  title?: string;
}> = ({ books, title }) => {
  return (
    <Paper shadow="xs" m={20} p="lg">
      <Title order={2} mb="md">
        {title == null ? "本一覧" : `${title}（${String(books.length)}冊）`}
      </Title>
      {books.length === 0 ? (
        <Text>この著者の本はありません</Text>
      ) : (
        <Table.ScrollContainer minWidth={650}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>書名</Table.Th>
                <Table.Th>ISBN</Table.Th>
                <Table.Th>形式</Table.Th>
                <Table.Th>既読</Table.Th>
                <Table.Th>所有</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {books.map((book) => (
                <Table.Tr key={book.id}>
                  <Table.Td>
                    <Link to="/books/$id" params={{ id: book.id }}>
                      {book.title}
                    </Link>
                  </Table.Td>
                  <Table.Td>{book.isbn}</Table.Td>
                  <Table.Td>{displayBookFormat(book.format)}</Table.Td>
                  <Table.Td>
                    <BooleanValue flag={book.read} />
                  </Table.Td>
                  <Table.Td>
                    <BooleanValue flag={book.owned} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Paper>
  );
};
