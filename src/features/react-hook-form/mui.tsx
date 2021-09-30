import { Select, TextField } from '@material-ui/core';
import { Control, Controller, Path } from 'react-hook-form';

type TextFieldProps<T> = { control: Control<T>; name: Path<T>; label: string };

const RhfTextField = <T,>(props: TextFieldProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, ...field } }) => (
      <TextField label={props.label} inputRef={ref} {...field} />
    )}
  />
);

type SelectProps<T> = { control: Control<T>; name: Path<T>; label: string };

const RhfSelect = <T,>(props: SelectProps<T>) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { ref, ...field } }) => (
      <Select label={props.label} inputRef={ref} {...field} />
    )}
  />
);

export { RhfTextField as TextField, RhfSelect as Select };
