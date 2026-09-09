export interface ValidationRule {
  field: string;
  rule: (value: unknown) => boolean;
  message: string;
}

export const validators = {
  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  email: (value: unknown): boolean => {
    if (!value || typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  url: (value: unknown): boolean => {
    if (!value || typeof value !== 'string') return false;
    if (value.startsWith('#') || value.startsWith('/')) return true; // Relative/anchor targets allowed
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  maxLength: (max: number) => (value: unknown): boolean => {
    if (typeof value === 'string') return value.length <= max;
    return true;
  },

  numericOrder: (value: unknown): boolean => {
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'string') return !isNaN(Number(value));
    return false;
  }
};

export function validateEntity<T extends Record<string, unknown>>(data: T, rules: ValidationRule[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const item of rules) {
    const value = data[item.field];
    if (!item.rule(value)) {
      errors[item.field] = item.message;
    }
  }

  return errors;
}
