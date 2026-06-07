import { cn, kbdVariants, Kbd as CoreKbd } from '@heroui/react';
import { type ComponentProps } from 'react';
import { tv } from 'tailwind-variants';

import { useHasKeyboard, useKeyboardShortcut } from '@hooks';
import { noop } from '@utils';

const customKbdVariants = tv({
  base: 'hidden',
  extend: kbdVariants,
  defaultVariants: {
    size: 'sm',
    variant: 'default',
  },
  variants: {
    size: {
      md: {
        base: 'h-6 px-2 leading-6',
      },
      sm: {
        base: 'h-5 px-1 text-xs leading-5',
      },
      xs: {
        base: 'h-4 px-0.5 text-xs leading-4',
      },
    },
  },
});

type KbdVariants = Parameters<typeof customKbdVariants>[0];

type KbdProps = ComponentProps<typeof CoreKbd> &
  KbdVariants & {
    isSolid?: boolean;
    shortcutParams?: Parameters<typeof useKeyboardShortcut>;
  };

const Kbd = ({
  className,
  isSolid = false,
  shortcutParams = ['', noop, { enabled: false }],
  size,
  variant = 'light',
  ...props
}: KbdProps) => {
  const hasKeyboard = useHasKeyboard();

  useKeyboardShortcut(...shortcutParams);

  const { base } = customKbdVariants({ size, variant });

  return (
    <CoreKbd
      className={base({
        className: cn(
          hasKeyboard && 'block',
          isSolid && 'bg-accent text-accent-foreground',
          className
        ),
      })}
      {...props}
    >
      <CoreKbd.Content>{props.children}</CoreKbd.Content>
    </CoreKbd>
  );
};

export default Kbd;
