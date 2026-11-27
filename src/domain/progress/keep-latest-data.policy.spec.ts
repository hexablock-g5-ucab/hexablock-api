import { KeepLatestDataPolicy } from './keep-latest-data.policy';

describe('KeepLatestDataPolicy', () => {
  const policy = new KeepLatestDataPolicy();

  it('should_return_the_incoming_data_when_it_is_present', () => {
    // Arrange
    const stored = { coins: 1, theme: 'dark' };
    const incoming = { coins: 2 };

    // Act
    const result = policy.merge(stored, incoming);

    // Assert
    expect(result).toEqual({ coins: 2 });
  });

  it('should_keep_the_stored_data_when_the_incoming_data_is_absent', () => {
    // Arrange
    const stored = { coins: 1 };

    // Act
    const result = policy.merge(stored, undefined);

    // Assert
    expect(result).toEqual({ coins: 1 });
  });

  it('should_keep_the_stored_data_when_the_incoming_data_is_an_empty_object', () => {
    // Arrange
    const stored = { coins: 1 };

    // Act
    const result = policy.merge(stored, {});

    // Assert
    expect(result).toEqual({ coins: 1 });
  });
});
