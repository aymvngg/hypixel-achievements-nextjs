import type { ButtonHTMLAttributes } from 'react';

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'grass' | 'stone' | 'gold' | 'red';
};

const variants = {
  grass: 'bg-mc-grass hover:bg-mc-grass-dark text-white',
  stone: 'bg-mc-stone hover:bg-mc-stone-light text-white',
  gold: 'bg-mc-dirt text-mc-gold',
  red: 'bg-mc-red text-white',
};

export function PixelButton({
  variant = 'grass',
  className = '',
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      type="button"
      className={`mc-btn px-4 py-2 text-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
