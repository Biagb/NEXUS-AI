import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#3B82F6]/10 text-[#2563EB]',
        secondary: 'bg-[#F1F5F9] text-[#475569]',
        success: 'bg-[#10B981]/10 text-[#059669]',
        warning: 'bg-[#F59E0B]/10 text-[#D97706]',
        destructive: 'bg-red-50 text-red-600',
        outline: 'border border-[#E2E8F0] text-[#475569] bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
