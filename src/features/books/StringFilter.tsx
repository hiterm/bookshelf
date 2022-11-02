import { TextInput } from "@mantine/core";

export type StringFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export const StringFilter = ({ value, onChange }: StringFilterProps) => {
  return (
    <TextInput
      value={value}
      onChange={event => onChange(event.target.value)}
    />
  );
};
