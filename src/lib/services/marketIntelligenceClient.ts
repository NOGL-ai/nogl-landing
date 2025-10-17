/**
 * Market Intelligence API Client
 * 
 * Handles communication with the Market Intelligence API for product similarity search
 */

import {
  MarketIntelligenceSearchRequest,
  MarketIntelligenceApiResponse,
  SimilaritySearchResult,
  SimilarityMatch,
  MarketIntelligenceError,
  MarketIntelligenceConfig,
  SearchOptions,
} from '@/types/market-intelligence';

class MarketIntelligenceClient {
  private config: MarketIntelligenceConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.MARKET_INTELLIGENCE_API_URL || 'https://v1-market-intelligence-api-351041537979.europe-west3.run.app',
      apiKey: process.env.MARKET_INTELLIGENCE_API_KEY || '',
      qdrantHost: process.env.QDRANT_HOST || 'https://vectorize.callapro.ai',
      qdrantApiKey: process.env.QDRANT_API_KEY || '',
      collectionName: process.env.QDRANT_COLLECTION_NAME || 'internal_collection_jng',
      defaultThreshold: 0.75,
      defaultLimit: 10,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
    };
  }

  /**
   * Search for similar products using an image URL
   */
  async searchSimilarProducts(
    imageUrl: string,
    options: SearchOptions = {}
  ): Promise<SimilaritySearchResult> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (!imageUrl || !this.isValidUrl(imageUrl)) {
        throw new Error('Invalid image URL provided');
      }

      if (!this.config.apiKey) {
        throw new Error('Market Intelligence API key not configured');
      }

      if (!this.config.qdrantApiKey) {
        throw new Error('Qdrant API key not configured');
      }

      // Prepare search parameters for multipart/form-data - matching the exact curl format
      const searchParams = {
        image_url: imageUrl,
        qdrant_host: this.config.qdrantHost,
        qdrant_api_key: this.config.qdrantApiKey,
        collection_name: this.config.collectionName,
        score_threshold: options.threshold ?? this.config.defaultThreshold,
        limit: options.limit ?? this.config.defaultLimit,
        offset: options.offset ?? 0,
        with_payload: options.includePayload ?? true,
        with_vector: options.includeVector ?? false,
        similarity_metric: options.similarityMetric ?? 'Cosine',
        vector_dim: 512, // Default vector dimension
        vector_name: 'default',
        image_vector_name: '',
        text_vector_name: '',
        filter_query: '',
        params: '',
        custom_vectors: '',
        file: '',
      };

      // Make API request with retry logic
      const response = await this.makeRequestWithRetry(searchParams);
      
      // Transform response
      const transformedResult = this.transformResponse(response, searchParams.score_threshold!);
      
      const searchTime = Date.now() - startTime;
      
      return {
        success: true,
        totalMatches: transformedResult.matches.length,
        closestMatch: transformedResult.matches[0],
        matches: transformedResult.matches,
        threshold: searchParams.score_threshold!,
        searchTime,
      };

    } catch (error) {
      console.error('Market Intelligence API error:', error);
      
      return {
        success: false,
        totalMatches: 0,
        matches: [],
        threshold: options.threshold ?? this.config.defaultThreshold,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        searchTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequestWithRetry(
    params: Record<string, any>,
    attempt: number = 1
  ): Promise<MarketIntelligenceApiResponse> {
    try {
      const formData = new FormData();
      
      // Add all parameters to form data
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.apiUrl}/search/internal`, {
        method: 'POST',
        headers: {
          'access_token': this.config.apiKey,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorText;
        try {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: MarketIntelligenceApiResponse = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }

      return data;

    } catch (error) {
      if (attempt < this.config.retryAttempts && this.isRetryableError(error)) {
        console.warn(`API request failed (attempt ${attempt}), retrying...`, error);
        
        // Exponential backoff: wait 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeRequestWithRetry(params, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Transform API response to our format
   */
  private transformResponse(
    response: MarketIntelligenceApiResponse,
    threshold: number
  ): { matches: SimilarityMatch[] } {
    const matches: SimilarityMatch[] = response.results
      .filter(result => result.score >= threshold)
      .map(result => this.transformMatch(result));

    return { matches };
  }

  /**
   * Transform individual match result
   */
  private transformMatch(result: any): SimilarityMatch {
    const payload = result.payload || {};
    
    return {
      id: result.id,
      name: payload.product_title || 'Unknown Product',
      score: result.score,
      price: payload.product_original_price || payload.product_discount_price,
      imageUrl: payload.product_page_image_url,
      brand: payload.product_brand,
      vendor: payload.product_vendor,
      category: payload.product_category,
      sku: payload.product_sku,
      url: payload.product_url,
      currency: payload.product_currency || 'EUR',
      condition: payload.product_condition,
      material: payload.product_material,
      color: payload.product_color,
      gender: payload.product_gender,
      season: payload.product_season,
      family: payload.product_family,
      sourceUrl: payload.source_url,
      extractionDate: payload.extraction_timestamp,
    };
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return true; // Timeout
    if (error.message?.includes('500')) return true; // Server error
    if (error.message?.includes('502')) return true; // Bad gateway
    if (error.message?.includes('503')) return true; // Service unavailable
    if (error.message?.includes('504')) return true; // Gateway timeout
    return false;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try a simple search with a dummy image URL
      const result = await this.searchSimilarProducts('https://example.com/test.jpg', {
        threshold: 0.1,
        limit: 1,
      });
      
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const marketIntelligenceClient = new MarketIntelligenceClient();

// Export class for testing
export { MarketIntelligenceClient };
