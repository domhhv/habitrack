import { cn, Kbd as HeroUIKbd } from '@heroui/react';
import { type ComponentProps } from 'react';
import { tv } from 'tailwind-variants';

import { useHasKeyboard, useKeyboardShortcut } from '@hooks';
import { noop } from '@utils';

const kbdVariants = tv({
  base: 'text-tiny hidden md:text-sm',
  defaultVariants: {
    color: 'default',
    size: 'sm',
  },
  variants: {
    color: {
      default: '',
      primary: 'bg-primary-400 dark:bg-primary-700',
      secondary: 'bg-secondary-300 dark:bg-secondary-700',
    },
    size: {
      md: 'px-1.5 py-0.5',
      sm: 'px-1 py-0',
    },
  },
});

type KbdVariants = Parameters<typeof kbdVariants>[0];

type KbdProps = ComponentProps<typeof HeroUIKbd> &
  KbdVariants & {
    shortcutParams?: Parameters<typeof useKeyboardShortcut>;
  };

const Kbd = ({
  className,
  color = 'default',
  shortcutParams = ['', noop, { enabled: false }],
  size = 'sm',
  ...props
}: KbdProps) => {
  const hasKeyboard = useHasKeyboard();

  useKeyboardShortcut(...shortcutParams);

  return (
    <HeroUIKbd
      className={cn(
        kbdVariants({ color, size }),
        hasKeyboard && 'block',
        className
      )}
      {...props}
    />
  );
};

export default Kbd;
