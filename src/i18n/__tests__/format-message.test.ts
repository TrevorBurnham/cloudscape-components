// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { formatMessage } from '../format-message';

describe('formatMessage', () => {
  describe('literal text', () => {
    it('formats simple literal text', () => {
      const ast = [{ type: 0 as const, value: 'Hello world' }];
      expect(formatMessage(ast, 'en')).toBe('Hello world');
    });

    it('concatenates multiple literals', () => {
      const ast = [
        { type: 0 as const, value: 'Hello ' },
        { type: 0 as const, value: 'world' },
      ];
      expect(formatMessage(ast, 'en')).toBe('Hello world');
    });
  });

  describe('argument interpolation', () => {
    it('interpolates string values', () => {
      const ast = [
        { type: 0 as const, value: 'Hello ' },
        { type: 1 as const, value: 'name' },
      ];
      expect(formatMessage(ast, 'en', { name: 'World' })).toBe('Hello World');
    });

    it('interpolates number values', () => {
      const ast = [
        { type: 0 as const, value: 'Count: ' },
        { type: 1 as const, value: 'count' },
      ];
      expect(formatMessage(ast, 'en', { count: 42 })).toBe('Count: 42');
    });

    it('handles missing values gracefully', () => {
      const ast = [
        { type: 0 as const, value: 'Hello ' },
        { type: 1 as const, value: 'name' },
      ];
      expect(formatMessage(ast, 'en', {})).toBe('Hello ');
    });
  });

  describe('select', () => {
    it('selects correct option', () => {
      const ast = [
        {
          type: 5 as const,
          value: 'gender',
          options: {
            male: { value: [{ type: 0 as const, value: 'He' }] },
            female: { value: [{ type: 0 as const, value: 'She' }] },
            other: { value: [{ type: 0 as const, value: 'They' }] },
          },
        },
        { type: 0 as const, value: ' liked this.' },
      ];
      expect(formatMessage(ast, 'en', { gender: 'male' })).toBe('He liked this.');
      expect(formatMessage(ast, 'en', { gender: 'female' })).toBe('She liked this.');
      expect(formatMessage(ast, 'en', { gender: 'unknown' })).toBe('They liked this.');
    });

    it('handles boolean-like select (true/false)', () => {
      const ast = [
        {
          type: 5 as const,
          value: 'hasFeedback',
          options: {
            true: { value: [{ type: 0 as const, value: 'With feedback' }] },
            other: { value: [{ type: 0 as const, value: 'Without feedback' }] },
          },
        },
      ];
      expect(formatMessage(ast, 'en', { hasFeedback: 'true' })).toBe('With feedback');
      expect(formatMessage(ast, 'en', { hasFeedback: 'false' })).toBe('Without feedback');
    });
  });

  describe('plural', () => {
    it('handles English plurals', () => {
      const ast = [
        {
          type: 6 as const,
          value: 'count',
          options: {
            one: { value: [{ type: 1 as const, value: 'count' }, { type: 0 as const, value: ' item' }] },
            other: { value: [{ type: 1 as const, value: 'count' }, { type: 0 as const, value: ' items' }] },
          },
          offset: 0,
          pluralType: 'cardinal' as const,
        },
      ];
      expect(formatMessage(ast, 'en', { count: 1 })).toBe('1 item');
      expect(formatMessage(ast, 'en', { count: 0 })).toBe('0 items');
      expect(formatMessage(ast, 'en', { count: 5 })).toBe('5 items');
    });

    it('handles exact matches (=0, =1)', () => {
      const ast = [
        {
          type: 6 as const,
          value: 'count',
          options: {
            '=0': { value: [{ type: 0 as const, value: 'No items' }] },
            '=1': { value: [{ type: 0 as const, value: 'One item' }] },
            other: { value: [{ type: 1 as const, value: 'count' }, { type: 0 as const, value: ' items' }] },
          },
          offset: 0,
          pluralType: 'cardinal' as const,
        },
      ];
      expect(formatMessage(ast, 'en', { count: 0 })).toBe('No items');
      expect(formatMessage(ast, 'en', { count: 1 })).toBe('One item');
      expect(formatMessage(ast, 'en', { count: 5 })).toBe('5 items');
    });

    it('handles zero plural category for languages that have it', () => {
      const ast = [
        {
          type: 6 as const,
          value: 'count',
          options: {
            zero: { value: [{ type: 0 as const, value: 'لا عناصر' }] },
            one: { value: [{ type: 0 as const, value: 'عنصر واحد' }] },
            two: { value: [{ type: 0 as const, value: 'عنصران' }] },
            other: { value: [{ type: 1 as const, value: 'count' }, { type: 0 as const, value: ' عناصر' }] },
          },
          offset: 0,
          pluralType: 'cardinal' as const,
        },
      ];
      // Arabic has zero, one, two, few, many, other categories
      expect(formatMessage(ast, 'ar', { count: 0 })).toBe('لا عناصر');
      expect(formatMessage(ast, 'ar', { count: 1 })).toBe('عنصر واحد');
      expect(formatMessage(ast, 'ar', { count: 2 })).toBe('عنصران');
    });
  });

  describe('tags (rich text)', () => {
    it('handles tag elements with function values', () => {
      const ast = [
        { type: 0 as const, value: 'Click ' },
        {
          type: 8 as const,
          value: 'Link',
          children: [{ type: 0 as const, value: 'here' }],
        },
        { type: 0 as const, value: ' to continue.' },
      ];

      const result = formatMessage(ast, 'en', {
        Link: (children: unknown[]) => `<a>${children.join('')}</a>`,
      });

      expect(result).toBe('Click <a>here</a> to continue.');
    });

    it('returns array when tag function returns non-string', () => {
      const ast = [
        { type: 0 as const, value: 'Click ' },
        {
          type: 8 as const,
          value: 'Link',
          children: [{ type: 0 as const, value: 'here' }],
        },
      ];

      const linkElement = { type: 'link', children: ['here'] };
      const result = formatMessage(ast, 'en', {
        Link: () => linkElement,
      });

      expect(result).toEqual(['Click ', linkElement]);
    });
  });

  describe('nested structures', () => {
    it('handles select inside plural', () => {
      // Example: "{count, plural, one {{gender, select, male {He has} female {She has} other {They have}} one item} other {They have {count} items}}"
      const ast = [
        {
          type: 6 as const,
          value: 'count',
          options: {
            one: {
              value: [
                {
                  type: 5 as const,
                  value: 'gender',
                  options: {
                    male: { value: [{ type: 0 as const, value: 'He has' }] },
                    female: { value: [{ type: 0 as const, value: 'She has' }] },
                    other: { value: [{ type: 0 as const, value: 'They have' }] },
                  },
                },
                { type: 0 as const, value: ' one item' },
              ],
            },
            other: {
              value: [
                { type: 0 as const, value: 'They have ' },
                { type: 1 as const, value: 'count' },
                { type: 0 as const, value: ' items' },
              ],
            },
          },
          offset: 0,
          pluralType: 'cardinal' as const,
        },
      ];

      expect(formatMessage(ast, 'en', { count: 1, gender: 'male' })).toBe('He has one item');
      expect(formatMessage(ast, 'en', { count: 1, gender: 'female' })).toBe('She has one item');
      expect(formatMessage(ast, 'en', { count: 5, gender: 'male' })).toBe('They have 5 items');
    });
  });

  describe('real-world examples from cloudscape', () => {
    it('formats step counter text', () => {
      // "Step {stepNumber} of {totalStepCount}"
      const ast = [
        { type: 0 as const, value: 'Step ' },
        { type: 1 as const, value: 'stepNumber' },
        { type: 0 as const, value: ' of ' },
        { type: 1 as const, value: 'totalStepCount' },
      ];
      expect(formatMessage(ast, 'en', { stepNumber: 2, totalStepCount: 5 })).toBe('Step 2 of 5');
    });

    it('formats file upload button text', () => {
      // "{multiple, select, true {Choose files} false {Choose file} other {}}"
      const ast = [
        {
          type: 5 as const,
          value: 'multiple',
          options: {
            true: { value: [{ type: 0 as const, value: 'Choose files' }] },
            false: { value: [{ type: 0 as const, value: 'Choose file' }] },
            other: { value: [] },
          },
        },
      ];
      expect(formatMessage(ast, 'en', { multiple: 'true' })).toBe('Choose files');
      expect(formatMessage(ast, 'en', { multiple: 'false' })).toBe('Choose file');
    });

    it('formats filtering counter text', () => {
      // "{count, plural, one {1 match} other {{count} matches}}"
      const ast = [
        {
          type: 6 as const,
          value: 'count',
          options: {
            one: { value: [{ type: 0 as const, value: '1 match' }] },
            other: {
              value: [
                { type: 1 as const, value: 'count' },
                { type: 0 as const, value: ' matches' },
              ],
            },
          },
          offset: 0,
          pluralType: 'cardinal' as const,
        },
      ];
      expect(formatMessage(ast, 'en', { count: 1 })).toBe('1 match');
      expect(formatMessage(ast, 'en', { count: 42 })).toBe('42 matches');
    });

    it('formats error boundary description with Feedback tag', () => {
      // "{hasFeedback, select, true {Refresh to try again. We are tracking this issue, but you can share <Feedback>more information here</Feedback>.} other {Refresh to try again.}}"
      const ast = [
        {
          type: 5 as const,
          value: 'hasFeedback',
          options: {
            true: {
              value: [
                { type: 0 as const, value: 'Refresh to try again. We are tracking this issue, but you can share ' },
                {
                  type: 8 as const,
                  value: 'Feedback',
                  children: [{ type: 0 as const, value: 'more information here' }],
                },
                { type: 0 as const, value: '.' },
              ],
            },
            other: { value: [{ type: 0 as const, value: 'Refresh to try again.' }] },
          },
        },
      ];

      expect(formatMessage(ast, 'en', { hasFeedback: 'false' })).toBe('Refresh to try again.');

      const result = formatMessage(ast, 'en', {
        hasFeedback: 'true',
        Feedback: (children: unknown[]) => `[LINK:${children.join('')}]`,
      });
      expect(result).toBe(
        'Refresh to try again. We are tracking this issue, but you can share [LINK:more information here].'
      );
    });
  });
});
