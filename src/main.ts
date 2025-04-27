// SPDX-FileCopyrightText: 2025  The GNOME Project (https://gnome.org)
// SPDX-License-Identifier: GPL-3.0-or-later

import { Application } from "./application.js";

export function main(argv: string[]): Promise<number> {
  const app = new Application();
  // @ts-expect-error gi.ts can't generate this, but it exists.
  return app.run(argv);
}
