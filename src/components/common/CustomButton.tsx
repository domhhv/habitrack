import {
  cn,
  Link,
  Button,
  buttonVariants,
  type LinkProps,
  type ButtonProps,
} from '@heroui/react';
import type { PointerEventHandler } from 'react';
import React from 'react';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import InfinityLoader from './InfinityLoader';

const customButtonVariants = tv({
  base: 'text-md relative overflow-hidden font-semibold data-[pending=true]:opacity-40',
  extend: buttonVariants,
  variants: {
    variant: {
      light:
        'text-accent hover:bg-accent-soft-hover data-[pending=true]:bg-background-300/50 bg-transparent shadow-none text-shadow-none',
    },
  },
});

type CustomButtonVariants = VariantProps<typeof customButtonVariants>;

type CustomButtonBaseProps = CustomButtonVariants & { className?: string };

export type CustomButtonProps =
  | (Omit<ButtonProps, 'className' | 'variant' | 'size'> &
      CustomButtonBaseProps & { href?: undefined })
  | (Omit<LinkProps, 'className' | 'variant' | 'size'> &
      CustomButtonBaseProps & { href: string });

const CustomButton = (props: CustomButtonProps) => {
  const createRipple: PointerEventHandler = React.useCallback((event) => {
    const button = event.currentTarget;

    if (!(button instanceof HTMLElement)) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    circle.addEventListener('animationend', circle.remove);

    button.appendChild(circle);
  }, []);

  const className = customButtonVariants({
    className: props.className,
    size: props.size,
    variant: props.variant,
  });

  if (props.href !== undefined) {
    const {
      className: _className,
      size: _size,
      variant: _variant,
      ...linkProps
    } = props;

    return (
      <Link
        {...linkProps}
        className={className}
        onPointerDown={(event) => {
          createRipple(event);
          linkProps.onPointerDown?.(event);
        }}
      />
    );
  }

  const {
    children,
    className: _className,
    href: _href,
    size,
    variant,
    ...buttonProps
  } = props;

  return (
    <Button
      size={size}
      {...(variant !== 'light' && { variant })}
      className={cn('data-[pending="true"]:opacity-75!', className)}
      {...buttonProps}
      onPointerDown={(event) => {
        createRipple(event);
        buttonProps.onPointerDown?.(event);
      }}
    >
      {({ isPending }) => {
        return (
          <>
            {isPending && <InfinityLoader />}
            {children}
          </>
        );
      }}
    </Button>
  );
};

export default CustomButton;
