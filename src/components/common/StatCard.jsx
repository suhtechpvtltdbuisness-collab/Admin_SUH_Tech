import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient = "from-blue-500 to-blue-600",
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600"
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={14} />;
    if (trend === 'down') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-500 text-sm font-medium mb-3">{title}</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          </div>

          {Icon && (
            <div className={`${iconBg} ${iconColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={24} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Trend indicator */}
        {trendValue && (
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
