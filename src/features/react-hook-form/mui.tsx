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

type UseControllerPropsWithTransform<IFieldValues, OutputValue> =
  UseControllerProps<IFieldValues> & {
    transform?: {
      input: { (value: OutputValue): string };
      output: {
        (
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): OutputValue;
      };
    };
  };

type TextFieldProps<T, U> = MuiTextFieldProps & {
  control: UseControllerPropsWithTransform<T, U>;
};

const RhfTextField = <T, U>({
  control: { name, control, transform },
  ...muiProps
}: TextFieldProps<T, U>) => {
  const {
    field: { ref, onChange, value, ...field },
  } = useController({
    name: name,
    control: control,
  });

  return (
    <TextField
      {...muiProps}
      {...field}
      inputRef={ref}
      onChange={
        transform === undefined
          ? onChange
          : (e) => onChange(transform.output(e))
      }
      value={transform === undefined ? value : transform.input(value)}
    />
  );
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
      <Select label={props.label} inputRef={ref} {...field} defaultValue="">
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
