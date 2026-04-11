import PrismOS from "prism-os";

const apiKey = process.env.PRISM_API_KEY;
if (!apiKey) {
  console.error("PRISM_API_KEY environment variable is required");
  process.exit(1);
}

export const prism = new PrismOS({ apiKey });
