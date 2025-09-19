"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

interface Props {
  callbackUrl?: string;
}

export default function GoogleSignInButton({ callbackUrl = "/" }: Props) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
    >
      <FcGoogle size={20} />
      <span className="text-sm font-medium text-gray-700">
        Sign in with Google
      </span>
    </button>
  );
}
