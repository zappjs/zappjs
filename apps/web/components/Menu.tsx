'use client';

import { MenuRounded } from '@mui/icons-material';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const pages = [
  {
    text: 'Docs',
    url: '/docs',
  },
  {
    text: 'Generators',
    url: '/generators',
  },
  {
    text: 'Playground',
    url: '/playground',
  },
];

export function Menu() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button className="md:hidden" onClick={() => setShow(!show)}>
        <MenuRounded className="text-4xl xs:text-3xl sm:text-2xl" />
      </button>
      <ul className="gap-4 hidden md:flex">
        <MenuContent />
      </ul>
      <MobileMenu onSelect={() => setShow(!show)} show={show} />
    </>
  );
}

function MenuContent({ onSelect }: { onSelect?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {pages.map((page) => (
        <li
          className={clsx(
            'text-center',
            pathname.startsWith(page.url)
              ? 'text-blue-400'
              : 'text-gray-700 hover:text-black dark:text-gray-200 dark:hover:text-white',
          )}
          key={page.url}
        >
          <Link href={page.url} onClick={onSelect}>
            {page.text}
          </Link>
        </li>
      ))}
    </>
  );
}

function MobileMenu({ onSelect, show }: { onSelect?: () => void; show: boolean }) {
  if (!show) {
    return null;
  }

  return createPortal(
    <ul className="backdrop-blur-2xl bg-slate-900 bg-opacity-50 bottom-0 flex flex-col fixed gap-4 justify-center items-center left-0 right-0 text-4xl top-0 md:hidden z-10">
      <MenuContent onSelect={onSelect} />
    </ul>,
    document.body,
  );
}
