import { createServer } from "node:net";
import { spawn } from "node:child_process";

const host = process.env.HOSTNAME;
const preferredPort = Number.parseInt(process.env.PORT ?? "3005", 10);
const maxAttempts = 10;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen({ port, host, exclusive: true });
  });
}

async function findOpenPort(startPort) {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidate = startPort + offset;
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No open port found between ${startPort} and ${startPort + maxAttempts - 1}.`,
  );
}

const port = await findOpenPort(preferredPort);

if (port !== preferredPort) {
  console.log(
    `Port ${preferredPort} is busy, starting Next.js on ${port} instead.`,
  );
}

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "dev", "--webpack", "-p", String(port)],
  {
    shell: process.platform === "win32",
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(port),
    },
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
