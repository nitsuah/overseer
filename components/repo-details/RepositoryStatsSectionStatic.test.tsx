import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RepositoryStatsSectionStatic, toFiniteNumber } from './RepositoryStatsSectionStatic';

afterEach(cleanup);

/**
 * Regression: Postgres NUMERIC columns (token_density, comment_to_code_ratio,
 * commit_frequency, avg_pr_merge_time_hours) come back from the Neon driver as
 * strings. A bare `.toFixed()` on one threw during render, and with no error
 * boundary that took the whole dashboard down ("This page couldn't load") the
 * moment any repo row was expanded.
 */
describe('RepositoryStatsSectionStatic with string-typed NUMERIC values', () => {
  it('renders without throwing and formats the values', () => {
    render(
      <RepositoryStatsSectionStatic
        totalLoc={1000}
        commitFrequency={'12.345' as unknown as number}
        avgPrMergeTimeHours={'21.7' as unknown as number}
        tokenDensity={'8.25' as unknown as number}
        commentToCodeRatio={'0.18' as unknown as number}
      />
    );

    expect(screen.getByText('12.3')).toBeTruthy();
    expect(screen.getByText('21.7h')).toBeTruthy();
    expect(screen.getByText(/8\.3 tok\/line|8\.2 tok\/line/)).toBeTruthy();
    expect(screen.getByText('18%')).toBeTruthy();
  });

  it('omits metrics whose values are null or non-numeric instead of throwing', () => {
    render(
      <RepositoryStatsSectionStatic
        totalLoc={1000}
        tokenDensity={null}
        commentToCodeRatio={'not-a-number' as unknown as number}
      />
    );

    expect(screen.queryByText(/tok\/line/)).toBeNull();
    expect(screen.queryByText(/Comment\/Code/)).toBeNull();
  });
});

describe('toFiniteNumber', () => {
  it('coerces numeric strings and rejects junk', () => {
    expect(toFiniteNumber('21.7')).toBe(21.7);
    expect(toFiniteNumber(3)).toBe(3);
    expect(toFiniteNumber(null)).toBeUndefined();
    expect(toFiniteNumber('')).toBeUndefined();
    expect(toFiniteNumber('abc')).toBeUndefined();
    expect(toFiniteNumber(Infinity)).toBeUndefined();
  });
});
