import React from 'react';

interface JewelryProduct {
  id: number;
  name: string;
  image: string;
  sku: string;
  brand: {
    name: string;
    logo?: string;
  };
  myPrice: number;
  competitorCount: number;
  status?: 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock';
  currency?: string;
  categories?: string[];
}

interface JewelryProductCellProps {
  product: JewelryProduct;
  showPrice?: boolean;
  showStatus?: boolean;
  showCompetitorCount?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const JewelryProductCell: React.FC<JewelryProductCellProps> = ({
  product,
  showPrice = true,
  showStatus = true,
  showCompetitorCount = true,
  showTooltip = true,
  size = 'md',
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Inactive': return 'text-tertiary bg-secondary_bg';
      case 'Low Stock': return 'text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'Out of Stock': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return '●';
      case 'Inactive': return '○';
      case 'Low Stock': return '⚠';
      case 'Out of Stock': return '✕';
      default: return '●';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-2 p-1.5',
          image: 'h-10 w-10',
          imageInner: 'h-8 w-8',
          statusIndicator: 'w-3 h-3 -top-0.5 -right-0.5',
          title: 'text-xs',
          subtitle: 'text-[10px]',
          price: 'text-xs',
          priceLabel: 'text-[10px]',
          badge: 'text-[9px] px-1.5 py-0.5',
          tooltip: 'text-[10px] px-2 py-1',
        };
      case 'lg':
        return {
          container: 'gap-4 p-3',
          image: 'h-20 w-20',
          imageInner: 'h-18 w-18',
          statusIndicator: 'w-5 h-5 -top-1 -right-1',
          title: 'text-base',
          subtitle: 'text-sm',
          price: 'text-lg',
          priceLabel: 'text-sm',
          badge: 'text-xs px-3 py-1',
          tooltip: 'text-sm px-4 py-2',
        };
      default: // md
        return {
          container: 'gap-3 p-2',
          image: 'h-12 w-12',
          imageInner: 'h-10 w-10',
          statusIndicator: 'w-4 h-4 -top-1 -right-1',
          title: 'text-sm',
          subtitle: 'text-xs',
          price: 'text-sm',
          priceLabel: 'text-xs',
          badge: 'text-[10px] px-2 py-0.5',
          tooltip: 'text-xs px-3 py-2',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const status = product.status || 'Active';

  return (
    <div className={`group relative flex items-start ${sizeClasses.container} rounded-lg hover:bg-secondary_bg/50 transition-colors ${className}`}>
      {/* Product Image with Status Indicator */}
      <div className="relative flex-shrink-0">
        <div className={`relative ${sizeClasses.image} rounded-lg border border-border bg-background p-1 shadow-sm`}>
          <img
            src={product.image}
            alt={`${product.name} product image`}
            className={`${sizeClasses.imageInner} rounded-md object-cover`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className={`${sizeClasses.imageInner} rounded-md bg-gray-200 items-center justify-center font-semibold text-gray-600 hidden`}
            style={{ display: 'none', fontSize: size === 'sm' ? '10px' : size === 'lg' ? '16px' : '12px' }}
          >
            {product.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Status indicator */}
          {showStatus && (
            <div className={`absolute ${sizeClasses.statusIndicator} rounded-full bg-white border border-gray-200 flex items-center justify-center`}>
              <span 
                className={`text-green-600 dark:text-green-400`}
                style={{ fontSize: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px' }}
              >
                {getStatusIcon(status)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* Product Name & Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={`${sizeClasses.title} font-semibold text-gray-900 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
              {product.name}
            </h3>
            <p className={`${sizeClasses.subtitle} text-tertiary truncate`}>{product.brand.name}</p>
          </div>
          {showPrice && (
            <div className="text-right flex-shrink-0">
              <div className={`${sizeClasses.price} font-bold text-gray-900`}>
                {product.myPrice.toLocaleString('de-DE', { 
                  style: 'currency', 
                  currency: product.currency || 'EUR' 
                })}
              </div>
              <div className={`${sizeClasses.priceLabel} text-gray-500`}>Your price</div>
            </div>
          )}
        </div>

        {/* SKU & Competitor Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`${sizeClasses.subtitle} text-gray-500 font-mono`}>#{product.sku}</span>
            {showCompetitorCount && (
              <>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <span className={`${sizeClasses.subtitle} text-gray-500`}>
                  {product.competitorCount} competitor{product.competitorCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          
          {/* Quick status badge */}
          {showStatus && (
            <span className={`inline-flex items-center gap-1 rounded-full ${sizeClasses.badge} font-medium ${getStatusColor(status)}`}>
              <span>{getStatusIcon(status)}</span>
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Hover tooltip with more details */}
      {showTooltip && (
        <div className={`absolute left-0 top-full mt-2 hidden group-hover:block z-50 bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap ${sizeClasses.tooltip}`}>
          <div className="space-y-1">
            <div className="font-semibold">{product.name}</div>
            <div className="text-gray-300">{product.brand.name}</div>
            <div className="text-gray-300">SKU: {product.sku}</div>
            {showPrice && (
              <div className="text-gray-300">
                Price: {product.myPrice.toLocaleString('de-DE', { 
                  style: 'currency', 
                  currency: product.currency || 'EUR' 
                })}
              </div>
            )}
            {showCompetitorCount && (
              <div className="text-gray-300">{product.competitorCount} competitors monitoring</div>
            )}
            {product.categories && product.categories.length > 0 && (
              <div className="text-gray-300">
                Categories: {product.categories.slice(0, 2).join(', ')}
                {product.categories.length > 2 && ` +${product.categories.length - 2} more`}
              </div>
            )}
          </div>
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default JewelryProductCell;
export type { JewelryProduct, JewelryProductCellProps };
