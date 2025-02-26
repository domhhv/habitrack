import { type ButtonProps, cn } from '@heroui/react';
import {
  BellRinging,
  CheckCircle,
  type Icon,
  Info,
  Question,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';
import React, { type ReactNode } from 'react';
import { type SetRequired, type ValueOf } from 'type-fest';

export type ButtonColor = ValueOf<
  SetRequired<Pick<ButtonProps, 'color'>, 'color'>
>;

const ICONS_BY_COLOR: Record<ButtonColor, Icon> = {
  secondary: Question,
  default: Info,
  success: CheckCircle,
  warning: Warning,
  danger: WarningCircle,
  primary: BellRinging,
};

export type AlertProps = {
  message: string;
  actions?: ReactNode[];
  color?: ButtonColor;
  description?: string;
  testId?: string;
};

const Alert = ({
  message,
  description,
  actions = [],
  color = 'default',
  testId = 'alert',
}: AlertProps) => {
  const alertClassName = cn(
    'flex items-center gap-2 rounded-md border px-4 py-2',
    color === 'default' &&
      'border-default-300 bg-default-50 text-default-700 dark:border-default-700 dark:bg-default-900 dark:text-default-100',
    color === 'primary' &&
      'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-200',
    color === 'secondary' &&
      'border-secondary-200 bg-secondary-100 text-secondary-700 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-200',
    color === 'success' &&
      'border-success-500 bg-success-300 text-success-800 dark:border-success-800 dark:bg-success-900 dark:text-success-200',
    color === 'warning' &&
      'border-warning-600 bg-warning-400 text-warning-800 dark:border-warning-900 dark:bg-warning-800 dark:text-warning-200',
    color === 'danger' &&
      'border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-700 dark:bg-danger-900 dark:text-danger-200'
  );

  const Icon = ICONS_BY_COLOR[color];

  return (
    <div className={alertClassName} data-testid={testId}>
      <Icon weight="bold" size={18} />
      <div className="flex w-full items-center justify-between gap-8">
        <div className="flex flex-col">
          <h6 className="font-semibold" data-testid="alert-message">
            {message}
          </h6>
          {description && <p className="text-sm">{description}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
};

export default Alert;
