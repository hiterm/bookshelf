import { UseFormReturnType } from "@mantine/form";
import React from "react";
import { BookFormFields, BookFormValues } from "./BookFormFields";

type BookUpdateFormProps = {
  form: UseFormReturnType<BookFormValues>;
};

export const BookUpdateForm: React.FC<BookUpdateFormProps> = ({ form }) => {
  return <BookFormFields form={form} />;
};
