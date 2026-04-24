import { Box, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import React from "react";
import { useUpdateAuthor } from "../../compoments/hooks/useUpdateAuthor";
import { LinkButton } from "../../compoments/mantineTsr";
import { authorFormSchema, type AuthorFormValues } from "./authorFormSchema";

type Author = {
  id: string;
  name: string;
};

export const AuthorDetailEdit: React.FC<{ author: Author }> = ({ author }) => {
  const navigate = useNavigate();
  const updateAuthorMutation = useUpdateAuthor();

  const form = useForm<AuthorFormValues>({
    initialValues: { name: author.name },
    validate: zod4Resolver(authorFormSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: AuthorFormValues) => {
    try {
      await updateAuthorMutation.mutateAsync({
        id: author.id,
        name: values.name,
      });
      await navigate({ to: "/authors/$id", params: { id: author.id } });
      showNotification({ message: "更新しました", color: "teal" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      showNotification({
        message: `更新に失敗しました: ${message}`,
        color: "red",
      });
    }
  };

  return (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      <Box
        component="form"
        onSubmit={form.onSubmit((values) => void handleSubmit(values))}
        style={{ minWidth: 400 }}
      >
        <TextInput label="名前" {...form.getInputProps("name")} />
        <Group mt="md">
          <Button type="submit">Save</Button>
          <LinkButton
            color="gray"
            linkOptions={{ to: "/authors/$id", params: { id: author.id } }}
          >
            Cancel
          </LinkButton>
        </Group>
      </Box>
    </Box>
  );
};
