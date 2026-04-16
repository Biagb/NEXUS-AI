import { Card, CardContent } from '@/components/ui';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('card-hover border-[#E2E8F0]/80 bg-white overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3.5">
          <p className="text-sm font-medium text-[#475569]">{title}</p>
          <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80 flex items-center justify-center">
            <Icon className="h-[18px] w-[18px] text-[#475569]" />
          </div>
        </div>
        <div className="text-[30px] font-bold text-[#1E293B] tracking-tight leading-none">{value}</div>
        <div className="flex items-center gap-2 mt-2.5">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                trend.isPositive 
                  ? 'text-[#059669] bg-[#10B981]/10' 
                  : 'text-red-600 bg-red-50'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <p className="text-xs text-[#64748B]">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
