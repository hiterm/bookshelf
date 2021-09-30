import { Select, TextField } from '@material-ui/core';
import { Control, Controller, Path, UseControllerProps } from 'react-hook-form';

type TextFieldProps<T> = {
  label: string;
} & UseControllerProps<T>;

const RhfTextField = <T,>(props: TextFieldProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, ...field } }) => (
      <TextField label={props.label} inputRef={ref} {...field} />
    )}
  />
);

type SelectProps<T> = {
  label: string;
  children: React.ReactNode;
} & UseControllerProps<T>;

const RhfSelect = <T,>(props: SelectProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, ...field } }) => (
      <Select label={props.label} inputRef={ref} {...field}>
        {props.children}
      </Select>
    )}
  />
);

export { RhfTextField as TextField, RhfSelect as Select };
