import { useState } from "react";
import {
  type CareersFormData,
  type CareersFormResponse,
  careersFormSchema,
} from "@/schema/zod/careers-form.zodschema";

const initialValues: CareersFormData = {
  name: "",
  email: "",
  role: "",
  resume: new File([], ""),
};

export const useCareersForm = () => {
  const [formData, setFormData] = useState<CareersFormData>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
  };

  const handleSubmit = async () => {
    const result = careersFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      const body = new FormData();
      body.append("name", result.data.name);
      body.append("email", result.data.email);
      body.append("role", result.data.role);
      body.append("resume", result.data.resume);

      const res = await fetch("/api/careers-form", {
        method: "POST",
        body,
      });

      const data = (await res.json().catch(() => null)) as CareersFormResponse;

      if (!res.ok) {
        const serverErrors: Record<string, string> = {};

        if (Array.isArray(data?.errors)) {
          for (const issue of data.errors) {
            const field = issue.path?.[0]?.toString();
            if (field && !serverErrors[field]) {
              serverErrors[field] = issue.message;
            }
          }
        }

        setErrors(
          Object.keys(serverErrors).length > 0
            ? serverErrors
            : { form: data?.error ?? "Submission failed" },
        );
        return;
      }

      setSubmitted(true);
      setResponseMessage(data?.message ?? "Thanks for your application!");
      resetForm();
      setTimeout(() => {
        setSubmitted(false);
        setResponseMessage(null);
      }, 3000);
    } catch {
      setErrors({ form: "Network error. Please try again." });
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    submitted,
    responseMessage,
    handleSubmit,
    resetForm,
  };
};
