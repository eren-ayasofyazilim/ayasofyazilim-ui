'use client';

import React, { ReactNode } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';

import AutoFormObject from './fields/object';
import { Dependency, FieldConfig } from './types';
import {
  ZodObjectOrWrapped,
  getDefaultValues,
  getObjectFormSchema,
} from './utils';

export * as AutoFormTypes from './types';
export * as AutoFormUtils from './utils';

export const AutoFormSubmit = ({
  children,
  className,
  disabled,
}: {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}) => (
  <Button type="submit" disabled={disabled} className={className}>
    {children ?? 'Submit'}
  </Button>
);
export type SchemaType = ZodObjectOrWrapped;
export type AutoFormProps = {
  children?: JSX.Element;
  className?: string;
  dependencies?: Dependency<z.infer<SchemaType>>[];
  fieldConfig?: FieldConfig<z.infer<SchemaType>>;
  formClassName?: string;
  formSchema: SchemaType;
  isLoading?: boolean;
  onParsedValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onSubmit?: (values: z.infer<SchemaType>) => void;
  onValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  showInRow?: boolean;
  values?: Partial<z.infer<SchemaType>>;
};

function AutoForm({
  formSchema,
  values: valuesProp,
  onValuesChange: onValuesChangeProp,
  onParsedValuesChange,
  onSubmit: onSubmitProp,
  fieldConfig,
  children,
  className,
  formClassName,
  dependencies,
  showInRow,
  isLoading,
}: AutoFormProps) {
  const objectFormSchema = getObjectFormSchema(formSchema);
  const defaultValues: DefaultValues<z.infer<typeof objectFormSchema>> | null =
    getDefaultValues(
      objectFormSchema,
      fieldConfig as FieldConfig<z.infer<typeof objectFormSchema>>
    );

  const form = useForm<z.infer<typeof objectFormSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? undefined,
    values: valuesProp,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) {
      onSubmitProp?.(parsedValues.data);
    }
  }

  const values = form.watch();
  // valuesString is needed because form.watch() returns a new object every time
  const valuesString = JSON.stringify(values);

  React.useEffect(() => {
    onValuesChangeProp?.(values);
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) {
      onParsedValuesChange?.(parsedValues.data);
    }
  }, [valuesString]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit)(e);
        }}
        className={cn('space-y-5', formClassName)}
      >
        <AutoFormObject
          isLoading={isLoading}
          showInRow={showInRow}
          schema={objectFormSchema}
          form={form}
          dependencies={dependencies}
          fieldConfig={fieldConfig}
          className={className}
        />

        {children}
      </form>
    </Form>
  );
}

export default AutoForm;
