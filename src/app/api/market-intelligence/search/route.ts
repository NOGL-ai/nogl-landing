/**
 * Market Intelligence Search API Route
 * 
 * Proxies requests to the Market Intelligence API and transforms responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketIntelligenceClient } from '@/lib/services/marketIntelligenceClient';
import { MarketIntelligenceSearchRequest, SimilaritySearchResult } from '@/types/market-intelligence';

export const maxDuration = 30; // 30 seconds max duration

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate request
    const validationResult = validateSearchRequest(body);
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    const { imageUrl, threshold = 0.75, limit = 10, offset = 0, searchExternal = false } = body as MarketIntelligenceSearchRequest;

    // Validate image URL
    if (!isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid image URL format' 
        },
        { status: 400 }
      );
    }

    // Validate threshold
    if (threshold < 0 || threshold > 1) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Threshold must be between 0 and 1' 
        },
        { status: 400 }
      );
    }

    // Validate pagination
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Limit must be between 1 and 100' 
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Offset must be non-negative' 
        },
        { status: 400 }
      );
    }

    // Check if Market Intelligence API is configured
    if (!process.env.MARKET_INTELLIGENCE_API_URL || !process.env.MARKET_INTELLIGENCE_API_KEY || !process.env.QDRANT_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Market Intelligence API not configured' 
        },
        { status: 500 }
      );
    }

    // Perform similarity search
    const searchResult: SimilaritySearchResult = await marketIntelligenceClient.searchSimilarProducts(
      imageUrl,
      {
        threshold,
        limit,
        offset,
        includePayload: true,
        includeVector: false,
        similarityMetric: 'Cosine',
      }
    );

    // Return results
    if (searchResult.success) {
      return NextResponse.json(searchResult, { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      });
    } else {
      return NextResponse.json(searchResult, { 
        status: 500 
      });
    }

  } catch (error) {
    console.error('Market Intelligence search error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate search request
 */
function validateSearchRequest(body: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be an object');
    return { valid: false, errors };
  }

  if (!body.imageUrl || typeof body.imageUrl !== 'string') {
    errors.push('imageUrl is required and must be a string');
  }

  if (body.threshold !== undefined && (typeof body.threshold !== 'number' || body.threshold < 0 || body.threshold > 1)) {
    errors.push('threshold must be a number between 0 and 1');
  }

  if (body.limit !== undefined && (typeof body.limit !== 'number' || body.limit < 1 || body.limit > 100)) {
    errors.push('limit must be a number between 1 and 100');
  }

  if (body.offset !== undefined && (typeof body.offset !== 'number' || body.offset < 0)) {
    errors.push('offset must be a non-negative number');
  }

  if (body.searchExternal !== undefined && typeof body.searchExternal !== 'boolean') {
    errors.push('searchExternal must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate image URL format
 */
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check if it looks like an image URL (optional, but helpful)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
      urlObj.pathname.toLowerCase().includes(ext)
    );
    
    // Allow URLs without image extensions (some APIs serve images without extensions)
    return true;
    
  } catch {
    return false;
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  try {
    // Test API connection
    const connectionTest = await marketIntelligenceClient.testConnection();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      marketIntelligenceApi: {
        configured: !!(process.env.MARKET_INTELLIGENCE_API_URL && process.env.MARKET_INTELLIGENCE_API_KEY && process.env.QDRANT_API_KEY),
        connectionTest,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
