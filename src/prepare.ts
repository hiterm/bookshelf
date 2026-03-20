export async function prepare(): Promise<void> {
  if (import.meta.env.VITE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start();
  }
}
