'use client';

import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'default';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** URL tujuan; bila path internal, navigasi memakai <Link> tanpa reload. */
  href?: string;
  /** Bila true, gaya tombol diterapkan ke satu child (mis. <Link/>) tanpa membungkusnya. */
  asChild?: boolean;
}

const BASE_STYLES =
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  default: 'bg-background text-foreground hover:bg-muted',
};

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 rounded-md px-3 text-sm',
  md: 'h-10 rounded-md px-4 py-2 text-sm',
  lg: 'h-11 rounded-md px-8 text-base',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      className = '',
      disabled,
      asChild = false,
      href,
      ...props
    },
    ref
  ) => {
    const classes = [BASE_STYLES, VARIANT_STYLES[variant], SIZE_STYLES[size], className]
      .filter(Boolean)
      .join(' ');

    const spinner = loading ? (
      <svg
        className="mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : null;

    // asChild: terapkan gaya ke child tunggal agar tidak ada <button> bersarang di dalam <a>.
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        ...props,
        className: [classes, child.props.className].filter(Boolean).join(' '),
      });
    }

    const content = (
      <>
        {spinner}
        {children}
      </>
    );

    // Navigasi internal memakai Link agar pindah halaman tanpa reload penuh.
    const anchorProps = props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>;

    if (href && href.startsWith('/')) {
      return (
        <Link href={href} ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorProps}>
          {content}
        </Link>
      );
    }

    if (href) {
      return (
        <a href={href} ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorProps}>
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
