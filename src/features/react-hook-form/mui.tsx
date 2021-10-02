import {
  Checkbox,
  FormControlLabel,
  Select,
  TextField,
} from '@material-ui/core';
import { HTMLInputTypeAttribute } from 'react';
import { Controller, UseControllerProps } from 'react-hook-form';

type TextFieldProps<T> = {
  label?: string;
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
      <Select inputRef={ref} {...field} defaultValue="">
        {props.children}
      </Select>
    )}
  />
);

type CheckboxProps<T> = {
  label: string;
  type?: HTMLInputTypeAttribute;
} & UseControllerProps<T>;

const RhfCheckbox = <T,>(props: CheckboxProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, value, ...field } }) => (
      <FormControlLabel
        control={<Checkbox checked={value} {...field} />}
        label={props.label}
      />
    )}
  />
);

export {
  RhfTextField as TextField,
  RhfSelect as Select,
  RhfCheckbox as Checkbox,
};
