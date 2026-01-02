// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import clsx from 'clsx';

import InternalAlert from '../alert/internal';
import InternalButton from '../button/internal';
import { useInternalI18n } from '../i18n/context';
import { ErrorBoundaryProps } from './interfaces';
import { refreshPage } from './utils';

import styles from './styles.css.js';
import testUtilStyles from './test-classes/styles.css.js';

/**
 * Simple parser for strings with XML-like tags (e.g., "<Feedback>text</Feedback>").
 * This is a lightweight alternative to intl-messageformat for this specific use case.
 * Only supports a single tag type with content - not full ICU syntax.
 */
function parseTaggedString(
  text: string,
  tagName: string,
  tagRenderer: (content: React.ReactNode) => React.ReactNode
): React.ReactNode[] {
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;

  const openIndex = text.indexOf(openTag);
  if (openIndex === -1) {
    return [text];
  }

  const closeIndex = text.indexOf(closeTag, openIndex);
  if (closeIndex === -1) {
    return [text];
  }

  const before = text.slice(0, openIndex);
  const content = text.slice(openIndex + openTag.length, closeIndex);
  const after = text.slice(closeIndex + closeTag.length);

  const result: React.ReactNode[] = [];
  if (before) {
    result.push(before);
  }
  result.push(tagRenderer(content || undefined));
  if (after) {
    // Recursively parse the rest in case there are more tags
    result.push(...parseTaggedString(after, tagName, tagRenderer));
  }
  return result;
}

export function ErrorBoundaryFallback({
  i18nStrings = {},
  renderFallback,
}: Pick<ErrorBoundaryProps, 'renderFallback' | 'i18nStrings'>) {
  const defaultSlots = {
    header: (
      <div className={clsx(styles.header, testUtilStyles.header)}>
        <DefaultHeaderContent i18nStrings={i18nStrings} />
      </div>
    ),
    description: (
      <div className={clsx(styles.description, testUtilStyles.description)}>
        <DefaultDescriptionContent i18nStrings={i18nStrings} />
      </div>
    ),
    action: (
      <div className={clsx(styles.action, testUtilStyles.action)}>
        <DefaultActionContent i18nStrings={i18nStrings} />
      </div>
    ),
  };
  return (
    <div className={testUtilStyles.fallback}>
      {renderFallback?.(defaultSlots) ?? (
        <InternalAlert type="error" header={defaultSlots.header} action={defaultSlots.action}>
          {defaultSlots.description}
        </InternalAlert>
      )}
    </div>
  );
}

function DefaultHeaderContent({ i18nStrings }: { i18nStrings: ErrorBoundaryProps.I18nStrings }) {
  const i18n = useInternalI18n('error-boundary');
  return <>{i18n('i18nStrings.headerText', i18nStrings?.headerText)}</>;
}

function DefaultDescriptionContent({
  i18nStrings: { descriptionText, components: { Feedback } = {} } = {},
}: {
  i18nStrings: ErrorBoundaryProps.I18nStrings;
}) {
  const i18n = useInternalI18n('error-boundary');

  // Format arguments for the i18n message, where tags are declared as functions.
  const formatArgs = Feedback
    ? {
        hasFeedback: true,
        Feedback: (chunks: React.ReactNode[]) => (
          <span className={testUtilStyles['feedback-action']}>
            <Feedback>{chunks[0] ?? ''}</Feedback>
          </span>
        ),
      }
    : { hasFeedback: false, Feedback: () => <></> };

  // Parse user-provided descriptionText for <Feedback> tags.
  // This is a lightweight alternative to intl-messageformat for this specific use case.
  function parseUserDescription(text?: string): React.ReactNode | undefined {
    if (!text) {
      return undefined;
    }
    if (!Feedback || !text.includes('<Feedback>')) {
      return text;
    }
    const feedbackRenderer = (content: React.ReactNode) => (
      <span className={testUtilStyles['feedback-action']}>
        <Feedback>{content ?? ''}</Feedback>
      </span>
    );
    const parts = parseTaggedString(text, 'Feedback', feedbackRenderer);
    return parts.length === 1 ? parts[0] : parts;
  }

  // Get the formatted message from i18n context.
  // If user provides descriptionText, parse it for <Feedback> tags.
  // The built-in message from I18nProvider is pre-compiled and supports the <Feedback> tag.
  const message = i18n('i18nStrings.descriptionText', parseUserDescription(descriptionText), format => format(formatArgs));

  // When the description includes <Feedback>, then the translated message is represented as an array of strings and
  // React elements that require keys when rendering to avoid React warnings.
  return (
    <>
      {Array.isArray(message) ? message.map((chunk, i) => <React.Fragment key={i}>{chunk}</React.Fragment>) : message}
    </>
  );
}

function DefaultActionContent({ i18nStrings }: { i18nStrings?: ErrorBoundaryProps.I18nStrings }) {
  const i18n = useInternalI18n('error-boundary');
  return (
    <InternalButton iconName="refresh" onClick={refreshPage} className={testUtilStyles['refresh-action']}>
      {i18n('i18nStrings.refreshActionText', i18nStrings?.refreshActionText)}
    </InternalButton>
  );
}
