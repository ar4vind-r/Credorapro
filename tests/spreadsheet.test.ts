import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSpreadsheet, detectNameColumn } from '../src/utils/spreadsheet.ts';

describe('Spreadsheet Parsing and Validation', () => {
  it('detects common name column header variations', () => {
    assert.equal(detectNameColumn(['name', 'course', 'date']), 'name');
    assert.equal(detectNameColumn(['Course', 'Full_Name', 'Date']), 'Full_Name');
    assert.equal(detectNameColumn(['STUDENT_NAME', 'Grade']), 'STUDENT_NAME');
    assert.equal(detectNameColumn(['id', 'recipient', 'award']), 'recipient');
    assert.equal(detectNameColumn(['custom_col1', 'custom_col2']), 'custom_col1'); // fallback to first column
    assert.equal(detectNameColumn([]), undefined);
  });

  it('rejects spreadsheets with no headers or empty rows', () => {
    const emptyResult = validateSpreadsheet('empty.csv', [], []);
    assert.equal(emptyResult.success, false);
    if (!emptyResult.success) {
      assert.match(emptyResult.error, /no valid column headers/i);
    }

    const noDataResult = validateSpreadsheet('nodata.csv', ['Name', 'Course'], []);
    assert.equal(noDataResult.success, false);
    if (!noDataResult.success) {
      assert.match(noDataResult.error, /No attendee rows found/i);
    }
  });

  it('filters out completely blank rows cleanly', () => {
    const rawRows = [
      { Name: 'Alice Smith', Course: 'Web Dev' },
      { Name: '', Course: '' },
      { Name: '   ', Course: '  ' },
      { Name: 'Bob Jones', Course: 'Data Science' },
    ];

    const result = validateSpreadsheet('attendees.csv', ['Name', 'Course'], rawRows);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.rows.length, 2);
      assert.equal(result.data.rows[0].Name, 'Alice Smith');
      assert.equal(result.data.rows[1].Name, 'Bob Jones');
    }
  });

  it('reports exact 1-indexed row number when a recipient name is missing', () => {
    // 1 header row + 12 valid rows + row 14 (13th data row) has missing name
    const rawRows: Record<string, any>[] = [];
    for (let i = 1; i <= 12; i++) {
      rawRows.push({ Name: `Recipient ${i}`, Course: 'Computer Science' });
    }
    // Row 14 in spreadsheet (index 12 in 0-based array)
    rawRows.push({ Name: '', Course: 'Computer Science' });

    const result = validateSpreadsheet('class_roster.csv', ['Name', 'Course'], rawRows);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(
        result.error,
        "Row 14 has no recipient name under column 'Name'. Fix it in your spreadsheet and re-upload."
      );
    }
  });

  it('handles duplicate recipient names by issuing a non-fatal warning', () => {
    const rawRows = [
      { Name: 'John Doe', Course: 'Physics' },
      { Name: 'Jane Smith', Course: 'Chemistry' },
      { Name: 'John Doe', Course: 'Biology' }, // Duplicate name
    ];

    const result = validateSpreadsheet('students.csv', ['Name', 'Course'], rawRows);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.rows.length, 3);
      assert.ok(result.warnings);
      assert.ok(result.warnings.some((w) => w.includes('duplicate recipient name')));
    }
  });

  it('accurately preserves and parses non-Latin characters (Malayalam, Hindi, Arabic, Japanese)', () => {
    const nonLatinRows = [
      { Name: 'അരവിന്ദ് രാധാകൃഷ്ണൻ', Course: 'സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയറിംഗ്' }, // Malayalam
      { Name: 'अरविन्द शर्मा', Course: 'डेटा साइंस' }, // Hindi / Devanagari
      { Name: 'أحمد محمود', Course: 'الذكاء الاصطناعي' }, // Arabic
      { Name: '田中 太郎', Course: '機械学習' }, // Japanese
    ];

    const result = validateSpreadsheet('international.csv', ['Name', 'Course'], nonLatinRows);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.rows.length, 4);
      assert.equal(result.data.rows[0].Name, 'അരവിന്ദ് രാധാകൃഷ്ണൻ');
      assert.equal(result.data.rows[1].Name, 'अरविन्द शर्मा');
      assert.equal(result.data.rows[2].Name, 'أحمد محمود');
      assert.equal(result.data.rows[3].Name, '田中 太郎');
    }
  });

  it('efficiently validates large spreadsheets with 500+ rows without performance degradation', () => {
    const largeRows: Record<string, any>[] = [];
    const count = 600;
    for (let i = 1; i <= count; i++) {
      largeRows.push({
        Name: `Attendee Name ${i}`,
        Course: `Course Title ${i % 10}`,
        Date: 'October 12, 2026',
        Score: `${85 + (i % 15)}%`,
      });
    }

    const startTime = performance.now();
    const result = validateSpreadsheet('huge_batch.xlsx', ['Name', 'Course', 'Date', 'Score'], largeRows);
    const duration = performance.now() - startTime;

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.rows.length, count);
    }
    // Validation of 600 rows must execute in under 50ms
    assert.ok(duration < 50, `Parsing 600 rows took ${duration}ms, expected < 50ms`);
  });
});
