import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  TextField,
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material';
import { useController, UseControllerProps } from 'react-hook-form';

type TextFieldProps<T> = MuiTextFieldProps & { control: UseControllerProps<T> };

const RhfTextField = <T,>({ control, ...muiProps }: TextFieldProps<T>) => {
  const {
    field: { ref, ...field },
  } = useController({
    name: control.name,
    control: control.control,
  });

  return <TextField {...muiProps} inputRef={ref} {...field} />;
};

type SelectProps<T> = {
  label: string;
  children: React.ReactNode;
  error?: boolean;
  helperText?: string;
} & UseControllerProps<T>;

const RhfSelect = <T,>(props: SelectProps<T>) => {
  const {
    field: { ref, ...field },
  } = useController({
    name: props.name,
    control: props.control,
  });

  return (
    <FormControl error={props.error}>
      <InputLabel>{props.label}</InputLabel>
      <Select inputRef={ref} {...field} defaultValue="">
        {props.children}
      </Select>
      <FormHelperText>{props.helperText}</FormHelperText>
    </FormControl>
  );
};

type CheckboxProps<T> = {
  label: string;
} & UseControllerProps<T>;

const RhfCheckbox = <T,>(props: CheckboxProps<T>) => {
  const {
    field: { ref, value, ...field },
  } = useController({
    name: props.name,
    control: props.control,
  });

  return (
    <FormControlLabel
      control={<Checkbox checked={value} {...field} />}
      label={props.label}
    />
  );
};

export {
  RhfTextField as TextField,
  RhfSelect as Select,
  RhfCheckbox as Checkbox,
};
