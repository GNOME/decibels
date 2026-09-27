import { Application } from "./application.js";

export function main(argv: string[]): number {
  const app = new Application();
  return app.run(argv);
}
