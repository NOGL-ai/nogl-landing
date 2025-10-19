/**
 * Repricing Rule Types
 * 
 * Type definitions for the repricing rule management system
 */

export type PriceDirection = 'plus' | 'minus' | 'percentage' | 'fixed';
export type ComparisonSource = 'my_price' | 'cheapest' | 'average' | 'specific';
export type ComparisonLogic = 'equal' | 'above' | 'below';
export type StopConditionType = 'price' | 'none';
export type MinMaxPriceType = 'manual' | 'gross_margin' | 'cost' | 'price' | 'map';
export type ProductSelectionType = 'all' | 'categories' | 'specific';

// Competitor interface
export interface Competitor {
  id: string;
  name: string;
  url: string;
  lastChecked: string;
  enabled: boolean;
  avatar?: string;
}

export interface PricingConfig {
  set_price: number;
  price_direction: PriceDirection;
  comparison_source: ComparisonSource;
  comparison_logic: ComparisonLogic;
  comparison_value?: number;
}

export interface StopCondition {
  type: StopConditionType;
  value?: string;
  filter?: string;
}

export interface MinMaxPrice {
  type: MinMaxPriceType;
  min?: {
    stay: string;
    value?: number;
  };
  max?: {
    stay: string;
    value?: number;
  };
}

export interface ProductSelection {
  type: ProductSelectionType;
  categories?: string[];
  product_ids?: string[];
}

export interface AutomationOptions {
  autopilot_after_import?: boolean;
  autopilot_fixed_time?: boolean;
  autopilot_fixed_time_value?: number;
}

export interface Automations {
  autopilot: boolean;
  options: AutomationOptions;
}

export interface AdjustCalculatedPrice {
  enabled: boolean;
  direction?: 'plus' | 'minus';
  value?: number;
  type?: 'percentage' | 'fixed';
}

export interface RoundingPriceOptions {
  value: number;
}

export interface RuleOptions {
  adjust_calculated_price: AdjustCalculatedPrice;
  rounding_price: boolean;
  rounding_price_options?: RoundingPriceOptions;
}

export interface ExportSettings {
  enabled: boolean;
  format: 'csv' | 'excel' | 'xml' | 'json';
  email_notification: boolean;
  email_address?: string;
}

export interface RepricingRule {
  id?: string;
  name: string;
  pricing: PricingConfig;
  competitors: string[] | Competitor[]; // competitor IDs or full objects
  stop_condition: StopCondition;
  min_max_price: MinMaxPrice;
  products: ProductSelection;
  automations: Automations;
  options: RuleOptions;
  export_settings: ExportSettings;
  created_at?: string;
  updated_at?: string;
}

export interface RepricingRuleFormData extends Omit<RepricingRule, 'id' | 'created_at' | 'updated_at'> {}

// Default empty rule for form initialization
export const defaultRepricingRule: RepricingRuleFormData = {
  name: '',
  pricing: {
    set_price: 0.1,
    price_direction: 'percentage',
    comparison_source: 'cheapest',
    comparison_logic: 'below',
  },
  competitors: [],
  stop_condition: {
    type: 'none',
  },
  min_max_price: {
    type: 'manual',
  },
  products: {
    type: 'all',
  },
  automations: {
    autopilot: false,
    options: {
      autopilot_fixed_time_value: 7,
    },
  },
  options: {
    adjust_calculated_price: {
      enabled: false,
      direction: 'plus',
      type: 'percentage',
    },
    rounding_price: false,
    rounding_price_options: {
      value: 99,
    },
  },
  export_settings: {
    enabled: false,
    format: 'csv',
    email_notification: false,
  },
};

// Validation helper types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

