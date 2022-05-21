import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  TextField,
  TextFieldProps as MuiTextFieldProps,
  Autocomplete,
  AutocompleteProps as MuiAutocompleteProps,
} from '@mui/material';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';

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

  const handleChange =
    transform === undefined
      ? onChange
      : (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(transform.output(e));
  // TODO: asを使わない形にする
  const transformedValue =
    transform === undefined ? value : transform.input(value as U);

  return (
    <TextField
      {...muiProps}
      {...field}
      inputRef={ref}
      onChange={handleChange}
      value={transformedValue}
    />
  );
};

type SelectProps<T> = {
  label: string;
  children: React.ReactNode;
  error?: boolean;
  helperText?: string;
} & UseControllerProps<T>;

const RhfSelect = <T extends FieldValues>(props: SelectProps<T>) => {
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

const RhfCheckbox = <T extends FieldValues>(props: CheckboxProps<T>) => {
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

type AutocompleteProps<IFieldValues, T> = Omit<
  MuiAutocompleteProps<T, boolean, boolean, boolean>,
  'renderInput'
> & {
  label: string;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  control: UseControllerProps<IFieldValues>;
};

const RhfAutocomplete = <IFieldValues extends FieldValues, T>(
  props: AutocompleteProps<IFieldValues, T>
) => {
  const {
    label,
    placeholder,
    error,
    helperText,
    control: { name, control },
    ...autocompleteProps
  } = props;

  const {
    field: { ref, onChange, value, ...field },
  } = useController({
    name: name,
    control: control,
  });

  return (
    <Autocomplete
      {...field}
      {...autocompleteProps}
      defaultValue={value}
      onChange={(_event, value) => {
        onChange(value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          inputRef={ref}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export {
  RhfTextField as TextField,
  RhfSelect as Select,
  RhfCheckbox as Checkbox,
  RhfAutocomplete as Autocomplete,
};
