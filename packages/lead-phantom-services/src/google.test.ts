import { describe, expect, it } from 'vitest';
import {
  buildSheetRows,
  normalizePlaceDetails,
  type LeadLocationInsert,
} from './google';

describe('normalizePlaceDetails', () => {
  it('maps Places payload to LeadLocation insert shape', () => {
    const row = normalizePlaceDetails('search-uuid', {
      place_id: 'ChIJxxx',
      displayName: { text: 'Phantom HVAC' },
      formattedAddress: '1 Neon Blvd, Dallas TX',
      nationalPhoneNumber: '214-555-0199',
      websiteUri: 'https://phantom.example',
      rating: 4.9,
    });

    expect(row.search_id).toBe('search-uuid');
    expect(row.place_id).toBe('ChIJxxx');
    expect(row.name).toBe('Phantom HVAC');
    expect(row.address).toContain('Dallas');
    expect(row.phone).toMatch(/214/);
    expect(row.website).toContain('phantom');
    expect(row.rating).toBe(4.9);
    expect(row.status).toBe('active');
    expect(row.last_seen_at).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('falls back to id when place_id missing', () => {
    const row = normalizePlaceDetails('s1', {
      id: 'legacy-id',
      displayName: { text: 'Legacy' },
    });
    expect(row.place_id).toBe('legacy-id');
  });
});

describe('buildSheetRows', () => {
  it('formats rows for Sheets append', () => {
    const locs: LeadLocationInsert[] = [
      {
        search_id: 's',
        place_id: 'p1',
        name: 'A',
        address: 'Addr',
        phone: '555',
        website: 'https://w',
        rating: 5,
        status: 'active',
        last_seen_at: '2026-01-01T00:00:00.000Z',
      },
      {
        search_id: 's',
        place_id: 'p2',
        name: null,
        address: null,
        phone: null,
        website: null,
        rating: null,
        status: 'active',
        last_seen_at: '2026-01-02T00:00:00.000Z',
      },
    ];

    const rows = buildSheetRows(locs);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual([
      'p1',
      'A',
      'Addr',
      '555',
      'https://w',
      '5',
      '2026-01-01T00:00:00.000Z',
    ]);
    expect(rows[1]).toEqual(['p2', '', '', '', '', '', '2026-01-02T00:00:00.000Z']);
  });
});
