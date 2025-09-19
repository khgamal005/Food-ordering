"use server";

import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { db } from "@/lib/prisma";
import getTrans from "@/lib/translation";
import { loginSchema, signUpSchema } from "@/validations/auth";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export const login = async (
  credentials: Record<"email" | "password", string> | undefined,
  locale: Locale
) => {
  const translations = await getTrans(locale);
  
  if (!credentials) {
    return null;
  }

  const schema = loginSchema(translations);
  const result = schema.safeParse(credentials);
  
  if (result.success === false) {
    // Return validation errors without throwing
    return {
      errors: result.error.flatten().fieldErrors,
      user: null,
    };
  }
  
  try {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
    });
    
    if (!user) {
      return {
        errors: { email: translations.messages.userNotFound },
        user: null,
      };
    }
    
    const isValidPassword = await bcrypt.compare(
      result.data.password,
      user.password
    );
    
    if (!isValidPassword) {
      return {
        errors: { password: translations.messages.incorrectPassword },
        user: null,
      };
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return {
      errors: null,
      user: userWithoutPassword,
    };
    
  } catch (error) {
    console.error(error);
    return {
      errors: { general: translations.messages.unexpectedError },
      user: null,
    };
  }
};
export const signup = async (prevState: unknown, formData: FormData) => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);
  const result = signUpSchema(translations).safeParse(
    Object.fromEntries(formData.entries())
  );
  if (result.success === false) {
    return {
      error: result.error.flatten().fieldErrors,
      formData,
    };
  }
  try {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
    });
    if (user) {
      return {
        status: 409,
        message: translations.messages.userAlreadyExists,
        formData,
      };
    }
    const hashedPassword = await bcrypt.hash(result.data.password, 10);
    const createdUser = await db.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: hashedPassword,
      },
    });
    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.USERS}`);
    revalidatePath(
      `/${locale}/${Routes.ADMIN}/${Pages.USERS}/${createdUser.id}/${Pages.EDIT}`
    );
    return {
      status: 201,
      message: translations.messages.accountCreated,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: translations.messages.unexpectedError,
    };
  }
};
