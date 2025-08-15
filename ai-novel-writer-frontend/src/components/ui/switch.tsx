import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              'block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out',
              'bg-muted border-2 border-transparent',
              'peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              className
            )}
          />
          <div
            className={cn(
              'absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out',
              'bg-background shadow-sm',
              'peer-checked:translate-x-4'
            )}
          />
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-foreground">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }