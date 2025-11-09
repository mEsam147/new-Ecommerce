// components/admin/products/ProductsStats.tsx
import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductsStatsProps {
  stats: {
    totalProducts: number;
    activeProducts: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    totalSales: number;
    totalViews?: number;
    conversionRate?: number;
  };
  loading?: boolean;
  className?: string;
}

export function ProductsStats({ stats, loading = false, className }: ProductsStatsProps) {
  const statItems = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
      description: 'All products in catalog',
      trend: null
    },
    {
      label: 'Active Products',
      value: stats.activeProducts,
      icon: CheckCircle,
      color: 'green',
      description: 'Currently available products',
      trend: stats.totalProducts > 0 ? (stats.activeProducts / stats.totalProducts) * 100 : 0,
      trendLabel: 'of total'
    },
    {
      label: 'Low Stock',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'amber',
      description: 'Products needing restock',
      trend: stats.totalProducts > 0 ? (stats.lowStock / stats.totalProducts) * 100 : 0,
      trendLabel: 'of total',
      alert: stats.lowStock > 0
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
      icon: XCircle,
      color: 'red',
      description: 'Products unavailable',
      trend: stats.totalProducts > 0 ? (stats.outOfStock / stats.totalProducts) * 100 : 0,
      trendLabel: 'of total',
      alert: stats.outOfStock > 0
    },
    {
      label: 'Inventory Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      description: 'Total inventory worth',
      trend: null
    },
    {
      label: 'Total Sales',
      value: stats.totalSales.toLocaleString(),
      icon: ShoppingCart,
      color: 'violet',
      description: 'All-time product sales',
      trend: null
    },
    {
      label: 'Product Views',
      value: (stats.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: 'cyan',
      description: 'Total product page views',
      trend: null
    },
    {
      label: 'Conversion Rate',
      value: `${(stats.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'fuchsia',
      description: 'View to purchase ratio',
      trend: stats.conversionRate || 0,
      trendLabel: 'target: 3%'
    },
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    cyan: 'from-cyan-500 to-cyan-600',
    fuchsia: 'from-fuchsia-500 to-fuchsia-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    violet: 'bg-violet-50 border-violet-200',
    cyan: 'bg-cyan-50 border-cyan-200',
    fuchsia: 'bg-fuchsia-50 border-fuchsia-200',
  };

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-8 bg-gray-300 rounded w-16 animate-pulse" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = colorClasses[stat.color as keyof typeof colorClasses];
          const bgColorClass = bgColorClasses[stat.color as keyof typeof bgColorClasses];

          return (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={cn(
                    "group relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
                    bgColorClass,
                    stat.alert && "ring-2 ring-red-200 ring-opacity-50"
                  )}
                >
                  {/* Background Gradient Effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                    colorClass
                  )} />

                  <div className="relative flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.label}
                      </p>

                      <div className="flex items-baseline gap-2 mb-2">
                        <p className={cn(
                          "text-2xl font-bold truncate",
                          stat.alert ? "text-red-600" : "text-gray-900"
                        )}>
                          {stat.value}
                        </p>

                        {stat.trend !== null && (
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            stat.alert
                              ? "bg-red-100 text-red-700"
                              : stat.trend > 75
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                          )}>
                            {stat.trend.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {stat.trendLabel && (
                        <p className="text-xs text-gray-500">
                          {stat.trendLabel}
                        </p>
                      )}
                    </div>

                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br shadow-sm transition-all duration-300 group-hover:scale-110",
                      colorClass
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Progress bar for trend indicators */}
                  {stat.trend !== null && (
                    <div className="relative mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(stat.trend, 100)}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          className={cn(
                            "h-1.5 rounded-full",
                            stat.alert
                              ? "bg-red-500"
                              : stat.trend > 75
                                ? "bg-green-500"
                                : "bg-blue-500"
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Alert indicator */}
                  {stat.alert && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="absolute -top-2 -right-2"
                    >
                      <div className="relative">
                        <div className="absolute animate-ping w-3 h-3 bg-red-400 rounded-full" />
                        <div className="relative w-3 h-3 bg-red-500 rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">{stat.label}</p>
                <p className="text-sm text-gray-600">{stat.description}</p>
                {stat.alert && (
                  <p className="text-sm text-red-600 font-medium mt-1">
                    Requires attention
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
