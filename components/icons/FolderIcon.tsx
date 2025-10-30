import React from 'react';

export const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 0 1-2.25-2.25V5.25A2.25 2.25 0 0 1 3.75 3h5.25a2.25 2.25 0 0 1 2.25 2.25v2.25m-7.5 0h7.5m-7.5 0-1 1.085a1.5 1.5 0 0 0 0 2.121l.5 1.5a2.25 2.25 0 0 0 2.121 1.5h10.158a2.25 2.25 0 0 0 2.121-1.5l.5-1.5a1.5 1.5 0 0 0 0-2.121l-1-1.085m-16.5 0h16.5"
    />
  </svg>
);
