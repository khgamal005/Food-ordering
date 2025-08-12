"use client";

import Link from "../link"; // assuming this wraps next/link
import { Button } from "../ui/button";
import { useState } from "react";
import { Menu, XIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Routes } from "../constants/enums";
import { Translations } from "@/types/translations";

function Navbar({
  translations,
}: {
  translations: Translations;
}) {
  const { locale } = useParams();
  const [openMenu, setOpenMenu] = useState(false);
  const pathname = usePathname();

  const links = [
    {
      id: crypto.randomUUID(),
      title: translations.navbar.menu,
      href: Routes.MENU,
    },
    {
      id: crypto.randomUUID(),
      title: translations.navbar.about,
      href: Routes.ABOUT,
    },
    {
      id: crypto.randomUUID(),
      title: translations.navbar.contact,
      href: Routes.CONTACT,
    },
  ];

  return (
    <nav className="order-last lg:order-none relative ">
      {/* Mobile menu button */}
      <Button
        variant="secondary"
        size="sm"
        className="lg:hidden "
        onClick={() => setOpenMenu(true)}
      >
        <Menu className="!w-6 !h-6" />
      </Button>

      {/* Links container */}
      <ul
        className={`fixed lg:static ${
          openMenu ? "left-0 z-50" : "-left-full"
        } top-0 px-10 py-20 lg:p-0 bg-background lg:bg-transparent transition-all duration-200 h-full lg:h-auto flex-col lg:flex-row w-full lg:w-auto flex items-start lg:items-center gap-10`}
      >
        {/* Close button in mobile */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-6 right-6 lg:hidden"
          onClick={() => setOpenMenu(false)}
        >
          <XIcon className="!w-6 !h-6" />
        </Button>

        {/* Render links */}
        {links.map((link) => (
<li 
  key={link.id} 
  className="hover:text-[hsl(9_100%_64%)] rounded-md transition-colors duration-300 "
>
  <Link
    onClick={() => setOpenMenu(false)}
    href={`/${link.href}`}
              className={`hover:text-primary duration-200 transition-colors font-semibold ${
                pathname.startsWith(`/${locale}/${link.href}`)
                  ? "text-primary"
                  : "text-accent"
              }`}  >
    {link.title}
  </Link>
</li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
