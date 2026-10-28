export async function lazy(): Promise<void> {
  const mod = await import('demo-lib');
  void mod;
}
