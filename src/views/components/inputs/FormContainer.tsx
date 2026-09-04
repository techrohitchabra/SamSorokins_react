import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// import React, { CSSProperties, FormHTMLAttributes } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";

import { ObjectSchema } from "yup";
import type { CSSProperties, FormHTMLAttributes } from "react";
import React from "react";

type ObjectShape = { [key: string]: yup.AnySchema };

/**
 * Props for the FormContainer component
 */

export type FormContainerProps<T extends ObjectShape = {}> = {
  validation?: ObjectSchema<T>;
  defaultValues?: Partial<T>;
  onSuccess?: (values: any) => void;
  handleSubmit?: (values: any) => void;
  formContext?: UseFormReturn<any>;
  FormProps?: FormHTMLAttributes<HTMLFormElement>;
  children?: React.ReactNode;
};

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

/**
 * Core component for handling form rendering and logic
 */

const FormContainerCore: React.FC<FormContainerProps> = ({
  defaultValues = {},
  onSuccess = () => {},
  validation,
  FormProps,
  children,
}) => {
  // Hook to initialize form methods with optional validation
  const methods = useForm<typeof defaultValues>({
    defaultValues,
    ...(validation ? { resolver: yupResolver(validation) } : {}),
  });
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSuccess)}
        noValidate
        style={formStyle}
        {...FormProps}
      >
        {children}
      </form>
    </FormProvider>
  );
};

/**
 * Custom FormContainer in which all the form wraps
 * @component FormContainer
 * @author Sanjay
 *
 */

const FormContainer: React.FC<FormContainerProps> = React.memo((props) => {
  if (!props.formContext && !props.handleSubmit) {
    return <FormContainerCore {...props} />;
  }
  if (props.handleSubmit && props.formContext) {
    return (
      <FormProvider {...props.formContext}>
        <form
          noValidate
          {...props.FormProps}
          style={formStyle}
          onSubmit={props.handleSubmit}
        >
          {props.children}
        </form>
      </FormProvider>
    );
  }
  if (props.formContext && props.onSuccess) {
    return (
      <FormProvider {...props.formContext}>
        <form
          onSubmit={props.formContext.handleSubmit(props.onSuccess)}
          style={formStyle}
          noValidate
          {...props.FormProps}
        >
          {props.children}
        </form>
      </FormProvider>
    );
  }

  return <div>Incomplete setup of FormContainer..</div>;
});

export default FormContainer;
