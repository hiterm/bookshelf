import { Box, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import React, { useRef, useState } from "react";
import { useUpdateAuthor } from "./api/useUpdateAuthor";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { LinkButton } from "../../components/mantineTsr";
import { authorFormSchema, type AuthorFormValues } from "./authorFormSchema";

type Author = {
  id: string;
  name: string;
  yomi: string;
};

export const AuthorEdit: React.FC<{ author: Author }> = ({ author }) => {
  const navigate = useNavigate();
  const updateAuthorMutation = useUpdateAuthor();
  const { reportError } = useAppError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const form = useForm<AuthorFormValues>({
    initialValues: { name: author.name, yomi: author.yomi },
    validate: zod4Resolver(authorFormSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: AuthorFormValues): Promise<void> => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await updateAuthorMutation.mutateAsync({
        id: author.id,
        name: values.name,
        yomi: values.yomi,
      });
      await navigate({ to: "/authors/$id", params: { id: author.id } });
      showNotification({ message: "更新しました", color: "teal" });
    } catch (error) {
      reportError({
        title: "著者の更新に失敗しました",
        operation: "UpdateAuthor",
        error,
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      <Box
        component="form"
        onSubmit={(event) => {
          form.onSubmit((values) => void handleSubmit(values))(event);
        }}
        style={{ minWidth: 400 }}
      >
        <TextInput label="名前" {...form.getInputProps("name")} />
        <TextInput label="読み仮名" {...form.getInputProps("yomi")} />
        <Group mt="md">
          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            Save
          </Button>
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
