type ResultOk<T> = { data: T; error: undefined };
type ResultError<E> = { data: undefined; error: E };

export type Result<T, E> = ResultOk<T> | ResultError<E>;

export const Result = {
  ok<T, E>(value: T): Result<T, E> {
    return { data: value, error: undefined };
  },

  error<T, E>(error: E): Result<T, E> {
    return { data: undefined, error };
  },

  isOk<T, E>(result: Result<T, E>): result is ResultOk<T> {
    return 'value' in result;
  },

  isError<T, E>(result: Result<T, E>): result is ResultError<E> {
    return 'error' in result;
  },
};
