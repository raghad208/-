import React from 'react';
import { ToolId } from '../types/game';

interface ToolIconProps {
  toolId: ToolId;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ toolId, className = 'w-7 h-7' }) => {
  switch (toolId) {
    case 'broom':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path d="M27 5L18 20" stroke="#92400E" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M13 18L22 23.5L20 27L11 21.5L13 18Z" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
          <path
            d="M11 21.5L5 31.5C4.5 32.3 5 33.5 6 33.8L15.5 36.2C16.5 36.4 17.5 35.8 18 34.8L20 27L11 21.5Z"
            fill="#FBBF24"
            stroke="#78350F"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9.5 29L8 34M13 30.5L11.8 35.2M16 31.5L15 35.6" stroke="#B45309" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );

    case 'sponge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="6" y="13" width="28" height="17" rx="4.5" fill="#FCD34D" stroke="#0F766E" strokeWidth="1.6" />
          <path d="M6 17.5C6 15 8 13 10.5 13H29.5C32 13 34 15 34 17.5V19H6V17.5Z" fill="#14B8A6" />
          <circle cx="13" cy="24" r="1.5" fill="#D97706" opacity="0.65" />
          <circle cx="20.5" cy="25.5" r="1.8" fill="#D97706" opacity="0.65" />
          <circle cx="27" cy="23.5" r="1.3" fill="#D97706" opacity="0.65" />
          <circle cx="10" cy="9.5" r="2.3" fill="#E0F2FE" stroke="#0D9488" strokeWidth="1.2" />
          <circle cx="16.5" cy="7" r="1.6" fill="#E0F2FE" stroke="#0D9488" strokeWidth="1.2" />
          <circle cx="29" cy="9" r="2" fill="#E0F2FE" stroke="#0D9488" strokeWidth="1.2" />
        </svg>
      );

    case 'mop':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path d="M20 4V23" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
          <rect x="12" y="21" width="16" height="4.5" rx="2" fill="#0284C7" stroke="#075985" strokeWidth="1.3" />
          <path
            d="M11 25.5L8.5 34.5C8.3 35.3 8.9 36 9.8 36H30.2C31.1 36 31.7 35.3 31.5 34.5L29 25.5H11Z"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14.5 26V35.5M20 26V35.5M25.5 26V35.5" stroke="#7DD3FC" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'duster':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path d="M8 33L19 22" stroke="#6D28D9" strokeWidth="3.2" strokeLinecap="round" />
          <path
            d="M17 20C14.5 16.5 16 11.5 20.5 10C21.5 6.5 26.5 6 29.5 9C33.5 9.5 35 14 32.5 17.5C34 21 30.5 25.5 26.5 24.5C24 27 19.5 25.5 18.5 22.5L17 20Z"
            fill="#C4B5FD"
            stroke="#6D28D9"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M23 15L28 12M25 19L30.5 17.5" stroke="#7C3AED" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
};
