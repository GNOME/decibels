import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GObject from "gi://GObject";

import { AddActionEntries, Window } from "./window.js";

export class Application extends Adw.Application {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super({
      application_id: pkg.name,
      resource_base_path: "/com/vixalien/decibels",
      flags: Gio.ApplicationFlags.HANDLES_OPEN,
    });

    (this.add_action_entries as AddActionEntries)([
      {
        name: "new-window",
        activate: () => {
          this.present_new_window();
        },
      },
      {
        name: "quit",
        activate: () => {
          this.quit();
        },
      },
      {
        name: "about",
        activate: () => {
          this.show_about_dialog_cb();
        },
      },
    ]);

    this.set_accels_for_action("app.new-window", ["<Control>n"]);
    this.set_accels_for_action("app.quit", ["<Control>q"]);
    this.set_accels_for_action("win.open-file", ["<Control>o"]);
  }

  private show_about_dialog_cb() {
    const aboutDialog = Adw.AboutDialog.new_from_appdata(
      `/com/vixalien/decibels/${pkg.name}.metainfo.xml`,
      // remove commit tag
      pkg.version.split("-")[0],
    );
    aboutDialog.set_version(pkg.version);
    aboutDialog.set_developers([
      "Angelo Verlain https://vixalien.com",
      "David Keller https://gitlab.com/BlobCodes",
    ]);
    aboutDialog.set_artists(["kramo https://kramo.page"]);
    aboutDialog.set_designers(["Allan Day"]);
    /* Translators: Replace "translator-credits" with your names, one name per line */
    aboutDialog.set_translator_credits(_("translator-credits"));

    aboutDialog.present(this.get_active_window());
  }

  private present_new_window() {
    const window = new Window({ application: this });
    if (pkg.name.endsWith("Devel")) window.add_css_class("devel");
    window.present();
    return window;
  }

  vfunc_activate(): void {
    this.present_new_window();
  }

  vfunc_open(files: Gio.FilePrototype[]): void {
    const window = this.get_active_window() ?? this.present_new_window();

    if (window instanceof Window && files.length > 0) {
      void window.load_file(files[0]);
    }
  }
}
