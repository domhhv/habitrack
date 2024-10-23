import { Button, type ButtonProps } from '@nextui-org/react';
import {
  BellRinging,
  CheckCircle,
  type Icon,
  Info,
  Question,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';
import clsx from 'clsx';
import React from 'react';
import { type SetRequired, type ValueOf } from 'type-fest';

export type ButtonColor = ValueOf<
  SetRequired<Pick<ButtonProps, 'color'>, 'color'>
>;

export type AlertOptions = {
  color?: ButtonColor;
  autoHideDuration?: number;
  dismissible?: boolean;
  description?: string;
  dismissText?: string;
  onDismiss?: () => void;
  testId?: string;
};

const ICONS_BY_COLOR: Record<ButtonColor, Icon> = {
  secondary: Question,
  default: Info,
  success: CheckCircle,
  warning: Warning,
  danger: WarningCircle,
  primary: BellRinging,
};

type AlertProps = AlertOptions & {
  message: string;
};

const Alert = ({
  message,
  description,
  dismissible,
  onDismiss,
  dismissText = 'Dismiss',
  color = 'default',
  testId = 'alert',
}: AlertProps) => {
  const endDecorator = dismissible ? (
    <Button onClick={onDismiss} size="sm" color={color} variant="flat">
      {dismissText}
    </Button>
  ) : null;

  const alertClassName = clsx(
    'flex items-center gap-4 rounded-md border px-4 py-2',
    color === 'default' &&
      'border-neutral-300 bg-slate-50 text-slate-700 dark:border-neutral-700 dark:bg-slate-900 dark:text-slate-100',
    color === 'primary' &&
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200',
    color === 'secondary' &&
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-200',
    color === 'success' &&
      'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900 dark:text-green-200',
    color === 'warning' &&
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200',
    color === 'danger' &&
      'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200'
  );

  const Icon = ICONS_BY_COLOR[color];

  return (
    <div className={alertClassName} data-testid={testId}>
      <Icon weight="bold" size={18} />
      <div className="flex w-full items-center justify-between gap-8">
        <div className="flex flex-col">
          <h6 className="font-semibold" data-testid="snackbar-message">
            {message}
          </h6>
          {description && <p className="text-sm">{description}</p>}
        </div>
        {endDecorator}
      </div>
    </div>
  );
};

export default Alert;
