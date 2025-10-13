/**
 * SimilaritySearchResults Component
 * 
 * Displays the results of a similarity search, showing match count and closest match
 */

'use client';

import React, { useState } from 'react';
import { SimilaritySearchResult, SimilarityMatch } from '@/types/market-intelligence';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Star, 
  TrendingUp,
  Image as ImageIcon,
  Package,
  Tag,
  Calendar,
  MapPin
} from 'lucide-react';

interface SimilaritySearchResultsProps {
  result: SimilaritySearchResult;
  originalProductName?: string;
  originalProductImage?: string;
  onViewAll?: () => void;
  className?: string;
}

export default function SimilaritySearchResults({
  result,
  originalProductName,
  originalProductImage,
  onViewAll,
  className = '',
}: SimilaritySearchResultsProps) {
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SimilarityMatch | null>(null);

  if (!result.success) {
    return (
      <Card className={`border-destructive bg-destructive/5 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <Package className="h-4 w-4" />
            <span className="font-medium">Search Failed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {result.error || 'Unable to search for similar products'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (result.totalMatches === 0) {
    return (
      <Card className={`border-muted bg-muted/5 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="font-medium">No Similar Products Found</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            No products found above {Math.round(result.threshold * 100)}% similarity threshold
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price?: number, currency = 'EUR') => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-blue-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.9) return 'default';
    if (score >= 0.8) return 'secondary';
    if (score >= 0.7) return 'outline';
    return 'destructive';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Found {result.totalMatches} similar product{result.totalMatches !== 1 ? 's' : ''}
          </h3>
          <Badge variant="secondary" className="text-xs">
            ≥{Math.round(result.threshold * 100)}% match
          </Badge>
        </div>
        {result.searchTime && (
          <span className="text-xs text-muted-foreground">
            {result.searchTime}ms
          </span>
        )}
      </div>

      {/* Closest Match */}
      {result.closestMatch && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Closest Match</CardTitle>
              <Badge variant={getScoreBadgeVariant(result.closestMatch.score)}>
                {formatScore(result.closestMatch.score)} similar
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4">
              {/* Images */}
              <div className="flex gap-2">
                {originalProductImage && (
                  <div className="relative">
                    <img
                      src={originalProductImage}
                      alt={originalProductName || 'Original product'}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-background border rounded-full p-1">
                      <ImageIcon className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
                {result.closestMatch.imageUrl && (
                  <div className="relative">
                    <img
                      src={result.closestMatch.imageUrl}
                      alt={result.closestMatch.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium text-foreground">{result.closestMatch.name}</h4>
                  {result.closestMatch.brand && (
                    <p className="text-sm text-muted-foreground">{result.closestMatch.brand}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {result.closestMatch.price && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{formatPrice(result.closestMatch.price, result.closestMatch.currency)}</span>
                    </div>
                  )}
                  {result.closestMatch.vendor && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{result.closestMatch.vendor}</span>
                    </div>
                  )}
                </div>

                {/* Similarity Score Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Similarity</span>
                    <span className="font-medium">{formatScore(result.closestMatch.score)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(result.closestMatch.score)}`}
                      style={{ width: `${result.closestMatch.score * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {result.closestMatch.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.closestMatch!.url, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Product
                    </Button>
                  )}
                  {result.closestMatch.sourceUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(result.closestMatch!.sourceUrl, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Source
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Matches */}
      {result.matches.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <Button
              variant="ghost"
              onClick={() => setShowAllMatches(!showAllMatches)}
              className="justify-start p-0 h-auto font-medium"
            >
              {showAllMatches ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              View all {result.matches.length} matches
            </Button>
          </CardHeader>
          
          {showAllMatches && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {result.matches.map((match, index) => (
                  <div
                    key={match.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedMatch?.id === match.id ? 'bg-muted border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedMatch(selectedMatch?.id === match.id ? null : match)}
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0">
                      {match.imageUrl ? (
                        <img
                          src={match.imageUrl}
                          alt={match.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{match.name}</h4>
                        <Badge variant={getScoreBadgeVariant(match.score)} className="text-xs">
                          {formatScore(match.score)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {match.brand && <span>{match.brand}</span>}
                        {match.price && <span>{formatPrice(match.price, match.currency)}</span>}
                        {match.vendor && <span>{match.vendor}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {match.url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(match.url, '_blank');
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* View All Button */}
      {onViewAll && result.totalMatches > 10 && (
        <div className="text-center">
          <Button variant="outline" onClick={onViewAll}>
            View All {result.totalMatches} Matches
          </Button>
        </div>
      )}
    </div>
  );
}

