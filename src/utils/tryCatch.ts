// Types for the result object with discriminated union
type Success<T> = [T, null];

type Failure<E> = [null, E];

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main function with overloads
export function tryCatch<T, E = Error>(
  fnOrPromise: Promise<T>
): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(
  fnOrPromise: () => Promise<T>
): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(fnOrPromise: () => T): Result<T, E>;

// Implementation
export function tryCatch<T, E = Error>(
  fnOrPromise: Promise<T> | (() => T) | (() => Promise<T>)
): Result<T, E> | Promise<Result<T, E>> {
  // Handle direct promises
  if (fnOrPromise instanceof Promise) {
    return fnOrPromise
      .then((data): Success<T> => [data, null])
      .catch((error): Failure<E> => [null, error as E]);
  }

  // Handle functions
  try {
    const result = fnOrPromise();
    if (result instanceof Promise) {
      return result
        .then((data): Success<T> => [data, null])
        .catch((error): Failure<E> => [null, error as E]);
    }
    return [result, null];
  } catch (error) {
    return [null, error as E];
  }
}
