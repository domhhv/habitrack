import type { ButtonProps } from '@heroui/react';
import { Button, buttonVariants } from '@heroui/react';
import type { MouseEventHandler } from 'react';
import React from 'react';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

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

export type CustomButtonProps = Omit<
  ButtonProps,
  'className' | 'variant' | 'size'
> &
  CustomButtonVariants & { className?: string };

const CustomButton = ({
  className,
  size,
  variant,
  ...props
}: CustomButtonProps) => {
  const createRipple: MouseEventHandler = React.useCallback((event) => {
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

    circle.addEventListener('animationend', () => {
      return circle.remove();
    });

    button.appendChild(circle);
  }, []);

  return (
    <Button
      size={size}
      {...(variant !== 'light' && { variant })}
      className={customButtonVariants({ className, size, variant })}
      {...props}
      onPointerDown={(event) => {
        createRipple(event);
        props.onPointerDown?.(event);
      }}
    />
  );
};

export default CustomButton;
