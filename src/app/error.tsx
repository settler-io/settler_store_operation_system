"use client"; // Error components must be Client Components

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div>
      <h2>Something went wrong!</h2>
      <pre>{JSON.stringify(error)}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
