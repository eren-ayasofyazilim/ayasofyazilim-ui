import Form, { ThemeProps } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useState } from 'react';
import { SchemaFormProps } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createSchemaWithFilters,
  flattenGenericData,
  generateFormData,
  generateUiSchema,
  hasPhoneFields,
  mergeUISchemaObjects,
  transformGenericSchema,
} from './utils';
import {
  CustomCheckbox,
  CustomCombobox,
  CustomDate,
  CustomSelect,
  CustomTextInput,
  CustomSwitch,
} from './widgets';
import { AsyncSelect, CustomPhoneField, FieldErrorTemplate } from './fields';
import {
  AccordionArrayFieldTemplate,
  ErrorListTemplate,
  FieldTemplate,
  ObjectFieldTemplate,
} from './templates';

export * from './utils';
export * from './types';

const ShadcnTheme: ThemeProps = {
  fields: {
    phone: CustomPhoneField,
  },
  widgets: {
    switch: CustomSwitch,
    CheckboxWidget: CustomCheckbox,
    combobox: CustomCombobox,
    SelectWidget: CustomSelect,
    'async-select': AsyncSelect,
    TextWidget: CustomTextInput,
    DateTimeWidget: CustomDate,
  },
  templates: {
    ArrayFieldTemplate: AccordionArrayFieldTemplate,
    ErrorListTemplate,
    FieldErrorTemplate,
    FieldTemplate,
    ObjectFieldTemplate,
  },
};

/**
 * SchemaForm component that renders a form based on the provided schema and options.
 * Extends the Form component from @rjsf/core.
 *
 * @param {SchemaFormProps} props - The props for the SchemaForm component.
 * @returns {JSX.Element} - The rendered form component.
 */
export function SchemaForm({ ...props }: SchemaFormProps) {
  const phoneFieldsConfig = {
    fields: ['areaCode', 'ituCountryCode', 'localNumber'],
    requireds: ['areaCode', 'ituCountryCode', 'localNumber'],
    name: 'phone',
  };
  let uiSchema = {}; // Initialize the UI schema
  const { usePhoneField, filter, children } = props; // Start with the provided schema
  let { schema } = props;
  let statedForm = props.formData;
  // If the phone field is enabled, transform the schema and generate UI schema
  if (usePhoneField) {
    schema = transformGenericSchema(
      schema,
      phoneFieldsConfig.fields, // Fields to transform
      phoneFieldsConfig.name, // The parent field name
      phoneFieldsConfig.requireds // Required fields
    );
    uiSchema = generateUiSchema(schema, phoneFieldsConfig.name, {
      'ui:field': phoneFieldsConfig.name, // Specify the field type for UI
    });
    if (hasPhoneFields(statedForm)) {
      statedForm = generateFormData(
        props.formData,
        phoneFieldsConfig.fields, // Fields to transform
        phoneFieldsConfig.name // The parent field name
      );
    }
  }
  if (filter) {
    schema = createSchemaWithFilters({
      filter,
      schema,
    });
  }
  // Merge any additional UI schema provided via props
  if (props.uiSchema) {
    uiSchema = mergeUISchemaObjects(uiSchema, props.uiSchema);
  }
  const [formData] = useState<any>(statedForm);
  return (
    <Form
      noHtml5Validate
      liveValidate
      focusOnFirstError
      showErrorList={props.showErrorList || false}
      {...props}
      className={cn('p-px', props.className)}
      formData={formData}
      schema={schema as RJSFSchema} // Cast schema to RJSFSchema type
      validator={validator} // Custom validator
      fields={{ ...ShadcnTheme.fields, ...props.fields }} // Merge custom fields
      widgets={{ ...ShadcnTheme.widgets, ...props.widgets }} // Merge custom widgets
      templates={{ ...ShadcnTheme.templates, ...props.templates }} // Merge custom templates
      uiSchema={uiSchema} // Set the generated UI schema
      onChange={(e) => {
        // Handle form data change
        if (props.usePhoneField) {
          e.formData = flattenGenericData(e.formData, 'phone', [
            'areaCode',
            'ituCountryCode',
            'localNumber',
          ]);
        }
        if (props.onChange) props.onChange(e); // Call the onChange prop if provided
      }}
      onSubmit={(_data, event) => {
        const data = _data;
        // Handle form submission
        if (props.usePhoneField) {
          data.formData = flattenGenericData(data.formData, 'phone', [
            'areaCode',
            'ituCountryCode',
            'localNumber',
          ]);
        }
        if (props.onSubmit) props.onSubmit(data, event); // Call the onSubmit prop if provided
      }}
    >
      {!children && (
        <div className="py-4 sticky bottom-0 bg-white flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      )}
    </Form>
  );
}
