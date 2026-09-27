import Adw from "gi://Adw";
import Gtk from "gi://Gtk?version=4.0";
import GObject from "gi://GObject";
import Gdk from "gi://Gdk?version=4.0";

import { Window } from "./window.js";
import { APHeaderBar } from "./header.js";
import { APWaveformScale } from "./waveform-scale.js";
import { APPlaybackRateButton } from "./playback-rate-button.js";
import { APVolumeButton } from "./volume-button.js";
import { get_cubic_volume, get_linear_volume } from "./stream.js";

GObject.type_ensure(APPlaybackRateButton.$gtype);
GObject.type_ensure(APVolumeButton.$gtype);
GObject.type_ensure(APWaveformScale.$gtype);

export class APPlayerState extends Adw.Bin {
  declare private readonly _labels: Gtk.Box;
  declare private readonly _timestamp_label: Gtk.Label;
  declare private readonly _duration_label: Gtk.Label;
  declare private readonly _volume_button: APVolumeButton;
  declare private readonly _playback_box: Gtk.Box;
  declare private readonly _playback_image: Gtk.Image;
  declare private readonly _playback_button: Gtk.Button;
  declare private readonly _waveform: APWaveformScale;

  declare readonly headerbar: APHeaderBar;

  static {
    GObject.registerClass(
      {
        GTypeName: "APPlayerState",
        Template: "resource:///org/gnome/Decibels/player.ui",
        InternalChildren: [
          "labels",
          "timestamp_label",
          "duration_label",
          "volume_button",
          "playback_box",
          "playback_image",
          "playback_button",
          "waveform",
        ],
        Children: ["headerbar"],
      },
      this,
    );
  }

  constructor(params?: Partial<Adw.Bin.ConstructorProps>) {
    super(params);
  }

  private initialize_player() {
    const window = this.get_root() as Window;

    if (!window || !(window instanceof Window)) return;

    // Enforce Left-to-Right direction for playback buttons and timeline
    const forced_ltr_widgets = [
      this._labels,
      this._timestamp_label,
      this._duration_label,
      this._playback_box,
    ];

    for (const widget of forced_ltr_widgets) {
      widget.set_direction(Gtk.TextDirection.LTR);
    }

    window.stream.bind_property_full(
      "duration",
      this._duration_label,
      "label",
      GObject.BindingFlags.SYNC_CREATE,
      () => {
        return [true, micro_to_string(window.stream.get_duration())];
      },
      null,
    );

    window.stream.bind_property_full(
      "timestamp",
      this._timestamp_label,
      "label",
      GObject.BindingFlags.SYNC_CREATE,
      (_binding, from: number) => {
        return [true, micro_to_string(from)];
      },
      null,
    );

    window.stream.bind_property_full(
      "volume",
      this._volume_button,
      "volume",
      GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL,
      (_binding, linear: number) => {
        return [true, get_cubic_volume(linear)];
      },
      (_binding, cubic: number) => {
        return [true, get_linear_volume(cubic)];
      },
    );

    window.stream.bind_property_full(
      "playing",
      this._playback_image,
      "icon-name",
      GObject.BindingFlags.SYNC_CREATE,
      (_binding, from: boolean) => {
        return [true, from ? "pause-large-symbolic" : "play-large-symbolic"];
      },
      null,
    );

    window.stream.bind_property_full(
      "playing",
      this._playback_button,
      "tooltip-text",
      GObject.BindingFlags.SYNC_CREATE,
      (_binding, from: boolean) => {
        return [true, from ? _("Pause") : _("Play")];
      },
      null,
    );

    window.stream.bind_property_full(
      "timestamp",
      this._waveform,
      "position",
      GObject.BindingFlags.SYNC_CREATE,
      (_binding, from: number) => {
        if ((this._waveform.get_state_flags() & Gtk.StateFlags.ACTIVE) != 0) {
          return [false, null];
        }

        return [
          true,
          Math.max(Math.min(from / window.stream.get_duration() || 0, 1), 0),
        ];
      },
      null,
    );

    window.stream.waveform_generator.bind_property(
      "peaks",
      this._waveform.paintable,
      "peaks",
      GObject.BindingFlags.SYNC_CREATE,
    );
  }

  private scroll_cb(
    controller: Gtk.EventControllerScroll,
    dx: number,
    dy: number,
  ) {
    const window = this.get_root() as Window;
    const stream = window?.stream;
    let delta = 0.0;

    if (!stream) return;

    const unit = controller.get_unit();

    if (unit === Gdk.ScrollUnit.WHEEL) {
      delta = (dx === 0 ? dy : dx) * 10;
    } else {
      delta = dx === 0 ? dy : dx;
    }

    stream.skip_seconds(delta);
  }

  private waveform_position_changed_cb(
    _waveform: APWaveformScale,
    value: number,
  ) {
    const window = this.get_root() as Window;
    const stream = window?.stream;

    if (!stream) return;

    stream.seek(value * stream.get_duration());
  }

  vfunc_root(): void {
    super.vfunc_root();

    const window = this.get_root() as Window;

    let listener: number | null = window.connect("notify::stream", () => {
      this.initialize_player();
      if (listener) window.disconnect(listener);
      listener = null;
    });
  }
}

function seconds_to_string(seconds: number) {
  // show the duration in the format "mm:ss"
  // show hours if the duration is longer than an hour

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  seconds = Math.floor(seconds % 60);

  let string = "";

  if (hours > 0) {
    string += hours.toString().padStart(2, "0") + ":";
  }

  string += minutes.toString().padStart(2, "0") + ":";

  string += seconds.toString().padStart(2, "0");

  return string;
}

function micro_to_seconds(micro: number) {
  return micro / 1000000;
}

function micro_to_string(micro: number) {
  return seconds_to_string(micro_to_seconds(micro));
}
