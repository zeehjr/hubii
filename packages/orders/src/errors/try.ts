type ResultOk<T> = { value: T; error: undefined };
type ResultError<E> = { value: undefined; error: E };

export type Result<T, E = unknown> = ResultOk<T> | ResultError<E>;

export const Result = {
  ok<T, E = unknown>(value: T): Result<T, E> {
    return { value, error: undefined };
  },

  error<T, E>(error: E): Result<T, E> {
    return { value: undefined, error };
  },

  isOk<T, E>(result: Result<T, E>): result is ResultOk<T> {
    return 'value' in result;
  },

  isError<T, E>(result: Result<T, E>): result is ResultError<E> {
    return 'error' in result;
  },
};

export async function tryCatch<T>(
  p: PromiseLike<T>
): Promise<Result<T, unknown>> {
  try {
    const result = await p;

    return Result.ok(result);
  } catch (error) {
    return Result.error(error);
  }
}
