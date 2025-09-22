export interface EarningsData {
    currentAudienceSize: number;
    projectedAudienceSize: number;
    sessionsPerMonth: number;
    participantsPerSession: number;
    pricePerSession: number;
    marketingExpenses: number;
    otherExpenses: number;
    preparationTime: number;
    administrativeTime: number;
    cancellationRate: number; // Expected as a fraction (e.g., 0.1 for 10%)
    platformFeeRate: number; // Make it required, not optional
  }
  
  export function calculateEarnings(data: EarningsData, isPlatform: boolean) {
    const {
      currentAudienceSize,
      projectedAudienceSize,
      sessionsPerMonth,
      participantsPerSession,
      pricePerSession,
      marketingExpenses,
      otherExpenses,
      preparationTime,
      administrativeTime,
      cancellationRate,
      platformFeeRate = 0.20, // Default to 20%
    } = data;
  
    const audienceSize = isPlatform ? projectedAudienceSize : currentAudienceSize;
    const actualSessions = sessionsPerMonth * (1 - cancellationRate);
    const totalRevenue = actualSessions * participantsPerSession * pricePerSession;
  
    const platformFee = isPlatform ? totalRevenue * platformFeeRate : 0;
    const totalCosts = marketingExpenses + otherExpenses + platformFee;
  
    const netIncome = totalRevenue - totalCosts;
  
    const totalTimeInvestment = actualSessions * (preparationTime + (isPlatform ? administrativeTime * 0.5 : administrativeTime));
    const effectiveHourlyRate = totalTimeInvestment ? netIncome / totalTimeInvestment : 0;
  
    const grossProfitMargin = totalRevenue ? netIncome / totalRevenue : 0;
  
    return {
      totalRevenue,
      totalCosts,
      netIncome,
      effectiveHourlyRate,
      audienceSize,
      timeSaved: isPlatform ? actualSessions * administrativeTime * 0.5 : 0,
      grossProfitMargin,
      isPlatform,
      totalTimeInvestment,
    };
  }
  