import type { ButtonProps } from '@heroui/react';
import { Button, buttonVariants } from '@heroui/react';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

const customButtonVariants = tv({
  base: 'text-md font-semibold shadow-md text-shadow-lg data-[pending=true]:opacity-40',
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
  return (
    <Button
      className={customButtonVariants({ className, size, variant })}
      {...props}
    />
  );
};

export default CustomButton;
