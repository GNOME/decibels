// SPDX-FileCopyrightText: 2025  The GNOME Project (https://gnome.org)
// SPDX-License-Identifier: GPL-3.0-or-later
//
import Adw from "gi://Adw";
import GObject from "gi://GObject";

export class APEmptyState extends Adw.Bin {
  static {
    GObject.registerClass(
      {
        GTypeName: "APEmptyState",
        Template: "resource:///org/gnome/Decibels/empty.ui",
        InternalChildren: ["statusPage"],
      },
      this,
    );
  }

  private _statusPage!: Adw.StatusPage;

  constructor(params?: Partial<Adw.Bin.ConstructorProperties>) {
    super(params);

    this._statusPage.icon_name = `${pkg.name}-symbolic`;
  }
}
