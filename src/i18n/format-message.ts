// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Lightweight ICU message formatter that interprets pre-compiled AST.
 *
 * This replaces intl-messageformat for the common case where messages are
 * pre-compiled at build time. It reduces bundle size by ~95KB by not
 * including the ICU parser.
 *
 * Supported AST node types (from @formatjs/icu-messageformat-parser):
 * - Type 0: Literal text
 * - Type 1: Argument (variable interpolation)
 * - Type 5: Select
 * - Type 6: Plural
 * - Type 8: Tag (rich text)
 */

// AST node types from @formatjs/icu-messageformat-parser
const TYPE_LITERAL = 0;
const TYPE_ARGUMENT = 1;
const TYPE_SELECT = 5;
const TYPE_PLURAL = 6;
const TYPE_TAG = 8;

interface LiteralElement {
  type: typeof TYPE_LITERAL;
  value: string;
}

interface ArgumentElement {
  type: typeof TYPE_ARGUMENT;
  value: string;
}

interface SelectElement {
  type: typeof TYPE_SELECT;
  value: string;
  options: Record<string, { value: MessageFormatElement[] }>;
}

interface PluralElement {
  type: typeof TYPE_PLURAL;
  value: string;
  options: Record<string, { value: MessageFormatElement[] }>;
  offset: number;
  pluralType: 'cardinal' | 'ordinal';
}

interface TagElement {
  type: typeof TYPE_TAG;
  value: string;
  children: MessageFormatElement[];
}

export type MessageFormatElement = LiteralElement | ArgumentElement | SelectElement | PluralElement | TagElement;

type FormatValues = Record<string, unknown>;

// Cache for PluralRules instances per locale
const pluralRulesCache = new Map<string, Intl.PluralRules>();

function getPluralRules(locale: string, type: 'cardinal' | 'ordinal'): Intl.PluralRules {
  const cacheKey = `${locale}:${type}`;
  let rules = pluralRulesCache.get(cacheKey);
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type });
    pluralRulesCache.set(cacheKey, rules);
  }
  return rules;
}

function formatElements(elements: MessageFormatElement[], locale: string, values: FormatValues): unknown[] {
  const result: unknown[] = [];

  for (const element of elements) {
    switch (element.type) {
      case TYPE_LITERAL:
        result.push(element.value);
        break;

      case TYPE_ARGUMENT: {
        const value = values[element.value];
        // Convert primitives to strings for consistent output
        if (value === undefined || value === null) {
          result.push('');
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          result.push(String(value));
        } else {
          // Keep objects/functions as-is (for React elements, etc.)
          result.push(value);
        }
        break;
      }

      case TYPE_SELECT: {
        // Convert value to string for lookup (handles booleans, numbers, etc.)
        const rawValue = values[element.value];
        const selectValue = rawValue === true ? 'true' : rawValue === false ? 'false' : String(rawValue ?? '');
        const option = element.options[selectValue] ?? element.options['other'];
        if (option) {
          result.push(...formatElements(option.value, locale, values));
        }
        break;
      }

      case TYPE_PLURAL: {
        const numValue = Number(values[element.value] ?? 0);
        const adjustedValue = numValue - (element.offset || 0);

        // First check for exact match (e.g., "=0", "=1")
        const exactKey = `=${numValue}`;
        let option = element.options[exactKey];

        // Then check plural category
        if (!option) {
          const pluralRules = getPluralRules(locale, element.pluralType || 'cardinal');
          const category = pluralRules.select(adjustedValue);
          option = element.options[category] ?? element.options['other'];
        }

        if (option) {
          // Replace # with the actual number in nested content
          const nestedValues = { ...values, '#': adjustedValue };
          result.push(...formatElements(option.value, locale, nestedValues));
        }
        break;
      }

      case TYPE_TAG: {
        const tagFn = values[element.value];
        if (typeof tagFn === 'function') {
          const children = formatElements(element.children, locale, values);
          result.push(tagFn(children));
        } else {
          // If no tag function provided, just render children
          result.push(...formatElements(element.children, locale, values));
        }
        break;
      }

      default:
        // Unknown type - skip
        break;
    }
  }

  return result;
}

/**
 * Formats a pre-compiled ICU message AST with the given values.
 *
 * @param ast - Pre-compiled message AST from @formatjs/icu-messageformat-parser
 * @param locale - Locale string for plural rules (e.g., 'en', 'de', 'ar')
 * @param values - Values to interpolate into the message
 * @returns Formatted message (string if all parts are strings, array otherwise)
 */
export function formatMessage(
  ast: MessageFormatElement[],
  locale: string,
  values: FormatValues = {}
): string | unknown[] {
  const parts = formatElements(ast, locale, values);

  // If all parts are strings, join them
  if (parts.every(part => typeof part === 'string')) {
    return parts.join('');
  }

  // Otherwise return array (for React elements, etc.)
  return parts;
}
