import gettext from "gettext";

// while waiting for https://github.com/gjsify/ts-for-gir/issues/220
declare namespace package {
  export const name: string;
  export const version: string;
  export const prefix: string;
  export const datadir: string;
  export const libdir: string;
  export const pkgdatadir: string;
  export const pkglibdir: string;
  export const moduledir: string;
  export const localedir: string;
}

declare global {
  const pkg: typeof package;

  const _: typeof gettext.gettext;
  const C_: typeof gettext.pgettext;
  const N_: (x: string) => string;
}
