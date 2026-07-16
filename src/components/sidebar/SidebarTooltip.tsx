import type { TooltipProps, TooltipContentProps } from '@heroui/react';
import { Tooltip } from '@heroui/react';
import type { ReactNode } from 'react';

type SidebarTooltipProps = {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  isEnabled: boolean;
  offset?: TooltipContentProps['offset'];
  placement?: TooltipContentProps['placement'];
} & TooltipProps;

const SidebarTooltip = ({
  children,
  className,
  content,
  isEnabled,
  offset = 8,
  placement = 'right',
  ...props
}: SidebarTooltipProps) => {
  if (!isEnabled) {
    return children;
  }

  return (
    <Tooltip {...props} delay={0} closeDelay={0}>
      <Tooltip.Trigger className={className}>{children}</Tooltip.Trigger>
      <Tooltip.Content offset={offset} placement={placement}>
        {content}
      </Tooltip.Content>
    </Tooltip>
  );
};

export default SidebarTooltip;
