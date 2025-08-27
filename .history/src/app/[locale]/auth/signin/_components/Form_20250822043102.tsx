"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { Pages, Routes } from "@/constants/enums";
import { toast } from "@/hooks/use-toast";
import useFormFields from "@/hooks/useFormFields";
import { IFormField } from "@/types/app";
import { Translations } from "@/types/translations";
import { signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";

function Form({ translations }: { translations: Translations }) {
  const router = useRouter();
  const { locale } = useParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { getFormFields } = useFormFields({
    slug: Pages.LOGIN,
    translations,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Clear previous errors
    setErrors({});
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle validation errors from server
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.validationError) {
            setErrors(errorData.validationError);
          }
          if (errorData.responseError) {
            toast({
              title: errorData.responseError,
              variant: "destructive",
            });
          }
        } catch (parseError) {
          // If it's not JSON, it's a general error
          toast({
            title: result.error,
            variant: "destructive",
          });
        }
        return;
      }

      if (result?.ok) {
        toast({
          title: translations.messages.loginSuccessful,
          className: "text-green-400",
        });
        router.replace(`/${locale}/${Routes.PROFILE}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: translations.messages.unexpectedError,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} ref={formRef}>
      {getFormFields().map((field: IFormField) => (
        <div key={field.name} className="mb-3">
          <FormFields {...field} ={errors} />
        </div>error
      ))}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <Loader /> : translations.auth.login.submit}
      </Button>
    </form>
  );
}

export default Form;