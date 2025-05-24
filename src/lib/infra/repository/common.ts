export function throwIfNotFound<T>(data: T | null): T {
  if (data === null) {
    throw new Error("NotFound");
  }

  return data;
}
