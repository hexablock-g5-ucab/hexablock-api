/** Every use case implements this port; aspects are decorators of the same interface. */
export interface UseCase<I, O> {
  execute(input: I): Promise<O>;
}
