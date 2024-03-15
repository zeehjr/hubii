import axios from 'axios';

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitForService({
  healthCheckUrl,
  onCheckFail,
  intervalMs = 5000,
}: {
  healthCheckUrl: string;
  intervalMs?: number;
  onCheckFail?: () => void;
}) {
  let running = false;

  while (!running) {
    try {
      await axios.get(healthCheckUrl, {
        validateStatus: (status) => status === 200,
      });

      return;
    } catch {
      onCheckFail?.();
      await sleep(intervalMs);
      continue;
    }
  }
}
