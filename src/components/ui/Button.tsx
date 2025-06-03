import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      type,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-100 text-gray-800 hover:bg-gray-200': variant === 'secondary',
            'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50': variant === 'outline',
            'bg-transparent text-gray-800 hover:bg-gray-100': variant === 'ghost',
            'bg-transparent text-blue-600 hover:underline p-0': variant === 'link',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'py-1 px-2 text-sm': size === 'sm',
            'py-2 px-4 text-base': size === 'md',
            'py-3 px-6 text-lg': size === 'lg',
            'opacity-75 cursor-not-allowed': isLoading || disabled,
          },
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
        type={type}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;