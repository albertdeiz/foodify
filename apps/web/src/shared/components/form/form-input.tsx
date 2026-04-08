import type { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

interface FormInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  description?: string
  disabled?: boolean
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  description,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              {...inputProps}
              type={type}
              value={field.value ?? ''}
              onChange={
                type === 'number'
                  ? (e) => field.onChange(e.target.valueAsNumber)
                  : field.onChange
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
