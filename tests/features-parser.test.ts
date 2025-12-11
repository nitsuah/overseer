import { test, expect } from 'vitest';
import { parseFeatures } from '../lib/parsers/features';

test('parseFeatures handles multiple categories with descriptions', () => {
  const content = `## Core Features

This is a description of core features.

- Feature A: Does something
- Feature B: Does something else

## Advanced Features

Advanced functionality here.

- Advanced 1: Complex feature
- Advanced 2: Another complex feature`;

  const result = parseFeatures(content);
  expect(result.categories).toHaveLength(2);
  expect(result.categories[0].name).toBe('Core Features');
  expect(result.categories[0].description).toBe('This is a description of core features.');
  expect(result.categories[0].items).toHaveLength(2);
  expect(result.categories[1].name).toBe('Advanced Features');
  expect(result.categories[1].description).toBe('Advanced functionality here.');
});

test('parseFeatures handles * bullets', () => {
  const content = `## Features

* Feature 1: First feature
* Feature 2: Second feature`;

  const result = parseFeatures(content);
  expect(result.categories[0].items).toHaveLength(2);
  expect(result.categories[0].items[0]).toBe('Feature 1: First feature');
});

test('parseFeatures removes bold formatting from items', () => {
  const content = `## Features

- **Bold Feature**: Description here
- **Another Bold**: More description`;

  const result = parseFeatures(content);
  expect(result.categories[0].items[0]).toBe('Bold Feature: Description here');
  expect(result.categories[0].items[1]).toBe('Another Bold: More description');
});

test('parseFeatures handles empty input gracefully', () => {
  const result = parseFeatures('');
  expect(result.categories).toHaveLength(0);
  expect(result.frontmatter).toEqual({});
});

test('parseFeatures ignores HTML comments', () => {
  const content = `## Features

<!-- This is a comment -->
- Feature A: Real feature`;

  const result = parseFeatures(content);
  expect(result.categories[0].items).toHaveLength(1);
  expect(result.categories[0].items[0]).toBe('Feature A: Real feature');
});

test('parseFeatures handles categories without descriptions', () => {
  const content = `## Quick Category

- Immediate feature`;

  const result = parseFeatures(content);
  expect(result.categories[0].description).toBeUndefined();
  expect(result.categories[0].items).toHaveLength(1);
});

test('parseFeatures handles h3 headers', () => {
  const content = `### Primary Features

- Feature X: Description`;

  const result = parseFeatures(content);
  expect(result.categories).toHaveLength(1);
  expect(result.categories[0].name).toBe('Primary Features');
});

test('parseFeatures skips HTML comments', () => {
  const content = `## Features

<!-- This is a comment -->
- Real feature: Not a comment`;

  const result = parseFeatures(content);
  expect(result.categories[0].items).toHaveLength(1);
  expect(result.categories[0].items[0]).toBe('Real feature: Not a comment');
});

test('parseFeatures handles frontmatter', () => {
  const content = `---
version: 1.0
author: Test
---

## Features

- Feature A: First`;

  const result = parseFeatures(content);
  expect(result.frontmatter.version).toBe(1.0);
  expect(result.frontmatter.author).toBe('Test');
  expect(result.categories).toHaveLength(1);
});

test('parseFeatures handles empty content', () => {
  const result = parseFeatures('');
  expect(result.categories).toHaveLength(0);
  expect(result.frontmatter).toEqual({});
});

test('parseFeatures ignores categories without items', () => {
  const content = `## Empty Category

## Valid Category

- Feature 1: Has items`;

  const result = parseFeatures(content);
  expect(result.categories).toHaveLength(1);
  expect(result.categories[0].name).toBe('Valid Category');
});

test('parseFeatures handles multi-line descriptions', () => {
  const content = `## Features

Line one of description.
Line two of description.

- Feature 1: Item`;

  const result = parseFeatures(content);
  expect(result.categories[0].description).toBe('Line one of description. Line two of description.');
});
