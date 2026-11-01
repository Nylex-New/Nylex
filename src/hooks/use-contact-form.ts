import { type SubmitEvent, useState } from "react";
import {
  type ContactFormData,
  type ContactFormResponse,
  contactFormSchema,
} from "@/schema/zod/contact-form.zodschema";

const initialValues: ContactFormData = {
  name: "",
  email: "",
  company: "",
  project: "",
  phone: "",
  website: "",
  privacy: false,
  promotions: false,
};

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
  };

  const handleSubmit = async (e?: SubmitEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    if (formData.website) {
      setSubmitted(true);
      setResponseMessage("Thanks for your message!");
      resetForm();
      return;
    }

    const result = contactFormSchema.safeParse(formData);

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
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = (await res.json().catch(() => null)) as ContactFormResponse;

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
      setResponseMessage(data?.message ?? "Thanks for your message!");
      resetForm();
      setTimeout(() => {
        setSubmitted(false);
        setResponseMessage(null);
      }, 3000);
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    submitted,
    responseMessage,
    isSubmitting,
    handleSubmit,
    resetForm,
  };
};
