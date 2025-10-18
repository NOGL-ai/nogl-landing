# Mastra Agents Documentation

This document provides a comprehensive guide to the AI agents available in the system, their capabilities, and how to interact with them.

## Overview

The system uses three specialized AI agents, each designed for specific tasks:

1. **Competitor Analyst** - Market intelligence and analysis (read-only)
2. **Data Manager** - Data operations with human approval workflows
3. **Pricing Strategist** - Pricing analysis and strategic recommendations

## Agent Selection

The system automatically routes user queries to the appropriate agent based on keywords and context:

- **Pricing/Strategy queries** → Pricing Strategist
- **Data modification queries** → Data Manager  
- **Analysis/Insight queries** → Competitor Analyst
- **Default** → Competitor Analyst

## 1. Competitor Analyst Agent

**Purpose**: Provides market intelligence and competitor insights without making data changes.

### Capabilities

- Analyze competitor pricing trends
- Compare prices across competitors
- Generate market insights and reports
- Identify pricing opportunities
- Provide competitive intelligence

### Available Tools

| Tool | Description | Input Parameters |
|------|-------------|------------------|
| `getCompetitors` | Retrieve competitor data | `status`, `name` (optional) |
| `getCompetitorPricing` | Get pricing data for competitors | `competitorId`, `productId`, `sku`, `dateRange` |
| `analyzePricingTrends` | Analyze pricing trends over time | `competitorId`, `productId`, `timeframe` |
| `getCompetitorNotes` | Retrieve competitor notes | `competitorId` |
| `getProductPricing` | Get product pricing information | `productId`, `sku` |

### Example Queries

```
"Analyze pricing trends for our top 5 competitors this month"
"Compare our prices with competitor X for product Y"
"Show me market insights for the electronics category"
"What are the pricing opportunities in our market?"
```

## 2. Data Manager Agent

**Purpose**: Manages data operations with human-in-the-loop (HITL) approval workflows.

### Capabilities

- Create new competitor entries
- Update existing competitor data
- Delete competitor records
- Add notes to competitors
- All operations require human approval

### Available Tools

| Tool | Description | HITL Required | Input Parameters |
|------|-------------|---------------|------------------|
| `createCompetitor` | Create new competitor | ✅ | `name`, `domain`, `website`, `description`, `categories` |
| `updateCompetitor` | Update competitor data | ✅ | `competitorId`, `name`, `domain`, `website`, `description`, `categories`, `status` |
| `deleteCompetitor` | Delete competitor | ✅ | `competitorId`, `reason` |
| `addCompetitorNote` | Add note to competitor | ✅ | `competitorId`, `note`, `category` |

### HITL Workflow

1. Agent proposes data operation
2. User reviews and can modify the data
3. User approves or rejects the operation
4. If approved, operation executes in database
5. User receives confirmation

### Example Queries

```
"Create a new competitor called TechCorp with domain techcorp.com"
"Update competitor X to add them to the electronics category"
"Delete competitor Y because they went out of business"
"Add a note to competitor Z about their new product launch"
```

## 3. Pricing Strategist Agent

**Purpose**: Provides pricing analysis and strategic recommendations with approval workflows.

### Capabilities

- Analyze pricing gaps and opportunities
- Suggest price changes
- Generate pricing reports
- Send pricing alerts via email
- All price changes require human approval

### Available Tools

| Tool | Description | HITL Required | Input Parameters |
|------|-------------|---------------|------------------|
| `analyzePricingGaps` | Analyze pricing gaps vs competitors | ❌ | `productId`, `competitorIds` |
| `suggestPriceChanges` | Suggest price changes | ✅ | `productId`, `currentPrice`, `suggestedPrice`, `reason` |
| `updateProductPrices` | Update product prices | ✅ | `updates` (array of price changes) |
| `sendPricingReport` | Send pricing report via email | ✅ | `to`, `subject`, `reportData` |
| `sendAlertEmail` | Send pricing alert email | ✅ | `to`, `subject`, `alertData` |

### HITL Workflow

1. Agent analyzes pricing data
2. Agent suggests price changes or sends reports
3. User reviews and can modify suggestions
4. User approves or rejects the action
5. If approved, changes are applied or emails are sent

### Example Queries

```
"Analyze pricing gaps for our top products vs competitors"
"Suggest price changes for product X based on market analysis"
"Send a pricing report to the team about competitor Y"
"Update prices for products A, B, and C based on market trends"
```

## Tool Reference

### Common Parameters

- `competitorId`: Unique identifier for a competitor
- `productId`: Unique identifier for a product
- `sku`: Stock Keeping Unit identifier
- `dateRange`: Object with `start` and `end` date strings
- `timeframe`: String like "last month", "last quarter", "last year"

### HITL Response Format

All HITL tools return responses in this format:

```typescript
{
  requiresApproval: true,
  action: "CREATE_COMPETITOR" | "UPDATE_COMPETITOR" | "DELETE_COMPETITOR" | "SEND_EMAIL" | "UPDATE_PRODUCT_PRICES",
  data: {
    // Tool-specific data
  },
  reason: "Human approval required for data modification",
  preview: "Preview of what will be changed"
}
```

## Error Handling

### Common Error Types

1. **Permission Errors**: User lacks required role for operation
2. **Validation Errors**: Invalid input data
3. **Not Found Errors**: Referenced record doesn't exist
4. **Duplicate Errors**: Record already exists

### Error Response Format

```typescript
{
  success: false,
  error: "Error type",
  message: "Human-readable error message",
  details?: "Additional error details"
}
```

## Best Practices

### For Users

1. **Be specific** in your queries to get better results
2. **Review carefully** before approving HITL operations
3. **Use descriptive reasons** when rejecting operations
4. **Check permissions** - some operations require specific roles

### For Developers

1. **Always validate** input parameters
2. **Check permissions** before executing operations
3. **Provide clear error messages** for users
4. **Log all operations** for audit purposes
5. **Test HITL workflows** thoroughly

## Troubleshooting

### Common Issues

**Q: Agent not responding to my query**
A: Check if your query contains relevant keywords. Try rephrasing or being more specific.

**Q: HITL approval dialog not appearing**
A: Ensure you have the required permissions for the operation. Check your user role.

**Q: Operation failed after approval**
A: Check the error message in the response. Common issues include validation errors or database constraints.

**Q: Agent selected wrong agent for my query**
A: The agent selection is keyword-based. Try including more specific terms related to your desired agent's capabilities.

### Getting Help

- Check the error messages in the UI
- Review the system logs for detailed error information
- Contact your system administrator for permission issues
- Refer to this documentation for tool-specific guidance

