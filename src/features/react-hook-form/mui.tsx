import { Select, TextField } from '@material-ui/core';
import { HTMLInputTypeAttribute } from 'react';
import { Control, Controller, Path, UseControllerProps } from 'react-hook-form';

type TextFieldProps<T> = {
  label: string;
  type?: HTMLInputTypeAttribute;
} & UseControllerProps<T>;

const RhfTextField = <T,>(props: TextFieldProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, ...field } }) => (
      <TextField
        label={props.label}
        type={props.type}
        inputRef={ref}
        {...field}
      />
    )}
  />
);

type SelectProps<T> = {
  children: React.ReactNode;
} & UseControllerProps<T>;

const RhfSelect = <T,>(props: SelectProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, ...field } }) => (
      <Select inputRef={ref} {...field}>
        {props.children}
      </Select>
    )}
  />
);

export { RhfTextField as TextField, RhfSelect as Select };
