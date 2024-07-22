import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";

import { Window } from "./window.js";

export class Application extends Adw.Application {
  private window?: Window;

  static {
    GObject.registerClass(this);
  }

  constructor() {
    super({
      application_id: pkg.name,
      resource_base_path: "/com/vixalien/decibels",
      flags: Gio.ApplicationFlags.HANDLES_OPEN,
    });

    const quit_action = new Gio.SimpleAction({ name: "quit" });
    quit_action.connect("activate", () => {
      this.quit();
    });

    this.add_action(quit_action);
    this.set_accels_for_action("app.quit", ["<Control>q"]);

    this.set_accels_for_action("win.open-file", ["<Control>o"]);

    const show_about_action = new Gio.SimpleAction({ name: "about" });
    show_about_action.connect("activate", this.show_about_dialog_cb.bind(this));

    this.add_action(show_about_action);

    Gio._promisify(Gtk.UriLauncher.prototype, "launch", "launch_finish");
  }

  private show_about_dialog_cb() {
    const aboutDialog = Adw.AboutDialog.new_from_appdata(
      "/com/vixalien/decibels/org.gnome.Decibels.metainfo.xml",
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

  private present_main_window(): void {
    if (!this.window) {
      this.window = new Window({ application: this });
      if (pkg.name.endsWith("Devel")) this.window.add_css_class("devel");
    }

    this.window.present();
  }

  vfunc_activate(): void {
    this.present_main_window();
  }

  vfunc_open(files: Gio.FilePrototype[]): void {
    this.present_main_window();

    const window = this.get_active_window();

    if (window && window instanceof Window && files.length > 0) {
      void window.load_file(files[0]);
    }
  }
}
