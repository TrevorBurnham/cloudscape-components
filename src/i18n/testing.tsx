// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';

import { namespace } from './context';
import { MessageFormatElement } from './format-message';
// It's okay for import for tests, because it's internal non-user code.
// eslint-disable-next-line @cloudscape-design/components/ban-files
import { I18nProvider, I18nProviderProps } from './provider';

interface TestI18nProviderProps {
  messages: Record<string, Record<string, string | MessageFormatElement[]>>;
  locale?: string;
  children: React.ReactNode;
}

/**
 * Converts a simple string (without ICU syntax) to AST format.
 * For strings with ICU syntax, they should be pre-compiled and passed as AST.
 */
function toAst(value: string | MessageFormatElement[]): MessageFormatElement[] {
  if (Array.isArray(value)) {
    return value;
  }
  // Simple string without ICU syntax - convert to literal AST
  return [{ type: 0, value }];
}

export default function TestI18nProvider({ messages = {}, locale = 'en', children }: TestI18nProviderProps) {
  // Convert all string messages to AST format
  const convertedMessages: I18nProviderProps.Messages = {
    [namespace]: {
      [locale]: Object.fromEntries(
        Object.entries(messages).map(([component, componentMessages]) => [
          component,
          Object.fromEntries(
            Object.entries(componentMessages).map(([key, value]) => [key, toAst(value)])
          ),
        ])
      ),
    },
  };

  return (
    <I18nProvider locale={locale} messages={[convertedMessages]}>
      {children}
    </I18nProvider>
  );
}
