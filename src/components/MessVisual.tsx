import React from 'react';
import { MessVariant } from '../types/game';

interface MessVisualProps {
  variant: MessVariant;
  hpRatio: number; // 1 = full mess, near 0 = almost cleaned
}

export const MessVisual: React.FC<MessVisualProps> = ({ variant, hpRatio }) => {
  const opacity = 0.35 + hpRatio * 0.65;

  switch (variant) {
    case 'paper':
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md" style={{ opacity }}>
          <path
            d="M17 26L25 14L39 17L49 28L44 45L29 49L15 41L17 26Z"
            fill="#F5F5F4"
            stroke="#57534E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M25 14L32 29L49 28M32 29L29 49M17 26L32 29" stroke="#A8A29E" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'bottle':
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md" style={{ opacity }}>
          <rect x="23" y="18" width="18" height="33" rx="5" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" />
          <rect x="27" y="11" width="10" height="7" rx="2" fill="#E0F2FE" stroke="#0369A1" strokeWidth="1.8" />
          <rect x="28" y="8" width="8" height="4" rx="1.5" fill="#0284C7" />
          <rect x="23" y="29" width="18" height="9" fill="#38BDF8" opacity="0.6" />
        </svg>
      );

    case 'can':
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md" style={{ opacity }}>
          <rect x="21" y="16" width="22" height="32" rx="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
          <rect x="22" y="16" width="20" height="4" rx="1.5" fill="#D6D3D1" />
          <rect x="22" y="44" width="20" height="4" rx="1.5" fill="#D6D3D1" />
          <path d="M25 28L39 34" stroke="#FECACA" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'wrapper':
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md" style={{ opacity }}>
          <path
            d="M14 23L22 26L42 22L50 18L47 42L40 40L21 44L14 46L17 34L14 23Z"
            fill="#FBBF24"
            stroke="#92400E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect x="24" y="27" width="16" height="11" rx="2" fill="#DC2626" opacity="0.85" />
        </svg>
      );

    case 'mud':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" style={{ opacity }}>
          <path
            d="M22 33C16 26 24 16 35 19C43 13 56 17 55 27C65 30 67 45 57 50C59 60 45 66 37 59C26 64 15 55 20 44C13 40 16 34 22 33Z"
            fill="#78350F"
            opacity="0.86"
          />
          <circle cx="15" cy="22" r="4" fill="#78350F" opacity="0.75" />
          <circle cx="64" cy="56" r="4.5" fill="#78350F" opacity="0.75" />
          <circle cx="61" cy="20" r="3" fill="#92400E" opacity="0.7" />
          <path d="M31 32C35 28 45 29 48 36" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      );

    case 'grease':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" style={{ opacity }}>
          <path
            d="M20 39C14 31 23 19 36 22C44 15 58 21 56 32C66 37 62 52 50 53C46 63 30 62 27 52C17 52 14 43 20 39Z"
            fill="#A16207"
            opacity="0.82"
          />
          <ellipse cx="38" cy="36" rx="10" ry="6" fill="#CA8A04" opacity="0.55" />
          <circle cx="64" cy="24" r="3.5" fill="#A16207" opacity="0.7" />
          <circle cx="17" cy="55" r="3" fill="#A16207" opacity="0.7" />
        </svg>
      );

    case 'coffee':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" style={{ opacity }}>
          <path
            d="M22 40C17 30 28 19 41 21C53 18 63 29 59 41C62 52 51 62 39 58C27 61 18 51 22 40Z"
            fill="#5C3A21"
            opacity="0.85"
          />
          <circle cx="40" cy="40" r="14" stroke="#3B2313" strokeWidth="2.5" fill="none" opacity="0.5" />
          <circle cx="63" cy="52" r="3.5" fill="#5C3A21" opacity="0.7" />
        </svg>
      );

    case 'water':
      return (
        <svg viewBox="0 0 84 64" className="w-full h-full" style={{ opacity }}>
          <path
            d="M14 35C10 25 22 16 37 18C48 13 65 18 68 29C75 35 69 48 54 48C45 53 26 52 20 45C13 44 12 39 14 35Z"
            fill="#38BDF8"
            opacity="0.65"
            stroke="#0284C7"
            strokeWidth="2"
          />
          <path d="M26 29C32 25 44 25 50 28" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="59" cy="37" r="3" fill="#E0F2FE" opacity="0.8" />
        </svg>
      );

    case 'soap_spill':
      return (
        <svg viewBox="0 0 84 64" className="w-full h-full" style={{ opacity }}>
          <path
            d="M15 36C12 24 25 16 40 19C53 14 68 21 67 32C73 41 64 50 50 48C40 53 23 50 18 43C13 41 13 38 15 36Z"
            fill="#2DD4BF"
            opacity="0.6"
            stroke="#0D9488"
            strokeWidth="2"
          />
          <circle cx="30" cy="30" r="5" fill="#F0FDFA" opacity="0.85" />
          <circle cx="46" cy="35" r="4" fill="#F0FDFA" opacity="0.85" />
          <circle cx="55" cy="27" r="3.2" fill="#F0FDFA" opacity="0.85" />
        </svg>
      );

    case 'cobweb':
      return (
        <svg viewBox="0 0 76 76" className="w-full h-full" style={{ opacity }}>
          <g stroke="#E7E5E4" strokeWidth="2" fill="none">
            <path d="M6 6L70 70M6 6L70 36M6 6L36 70M6 6L70 10M6 6L10 70" stroke="#78716C" strokeWidth="1.6" opacity="0.7" />
            <path d="M10 26C19 25 25 19 26 10" stroke="#A8A29E" strokeWidth="1.8" />
            <path d="M12 44C28 41 41 28 44 12" stroke="#A8A29E" strokeWidth="1.8" />
            <path d="M15 62C38 56 56 38 62 15" stroke="#A8A29E" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case 'dust':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full" style={{ opacity }}>
          <path
            d="M22 44C14 44 10 37 14 31C14 23 22 18 31 20C36 13 49 14 53 22C62 22 68 30 64 38C66 44 60 49 52 47C45 51 31 50 22 44Z"
            fill="#A8A29E"
            opacity="0.75"
            stroke="#78716C"
            strokeWidth="1.6"
          />
          <circle cx="29" cy="33" r="3" fill="#D6D3D1" />
          <circle cx="45" cy="29" r="3.5" fill="#D6D3D1" />
          <circle cx="52" cy="39" r="2.5" fill="#D6D3D1" />
        </svg>
      );
  }
};
