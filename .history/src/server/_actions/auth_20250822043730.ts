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
  
  // Validate credentials exist
  if (!credentials) {
    throw new Error(JSON.stringify({
      validationError: {
        general: translations.messages.invalidCredentials,
      }
    }));
  }

  // 🔹 FIX: Call the function to get the schema instance
  const schema = loginSchema(translations);
  const result = schema.safeParse(credentials);
  
  if (result.success === false) {
    // Throw validation errors in a format that can be parsed by the client
    throw new Error(JSON.stringify({
      validationError: result.error.flatten().fieldErrors,
    }));
  }
  
  try {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
    });
    
    if (!user) {
      throw new Error(JSON.stringify({
        validationError: {
          email: translations.messages.userNotFound,
        },
      }));
    }
    
    const isValidPassword = await bcrypt.compare(
      result.data.password,
      user.password
    );
    
    if (!isValidPassword) {
      throw new Error(JSON.stringify({
        validationError: {
          password: translations.messages.incorrectPassword,
        },
      }));
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
    
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('validationError')) {
      throw error; // Re-throw validation errors
    }
    throw new Error(JSON.stringify({
      validationError: {
        general: translations.messages.unexpectedError,
      },
    }));
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
