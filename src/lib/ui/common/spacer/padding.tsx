export function Padding({ size }: { size?: string }) {
  return <div style={{ padding: size ?? "0" }}></div>;
}
