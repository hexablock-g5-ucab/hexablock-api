import { aScoreEntry } from '../../../test/helpers/score-entry.builder';

describe('ScoreEntry', () => {
  it('should_keep_its_createdAt_when_the_source_or_returned_date_is_mutated', () => {
    // Arrange
    const source = new Date('2026-11-27T10:00:00.000Z');
    const entry = aScoreEntry({ createdAt: source });

    // Act
    source.setTime(0);
    entry.createdAt.setTime(0);

    // Assert
    expect(entry.createdAt.toISOString()).toBe('2026-11-27T10:00:00.000Z');
  });

  it('should_reject_changes_when_a_field_is_reassigned', () => {
    // Arrange
    const entry = aScoreEntry({ score: 500 });

    // Act
    const reassign = () => {
      (entry as { score: number }).score = 9999;
    };

    // Assert
    expect(reassign).toThrow(TypeError);
    expect(entry.score).toBe(500);
  });
});
