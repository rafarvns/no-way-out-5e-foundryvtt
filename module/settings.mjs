/**
 * No Way Out! - 5e
 * Game Settings & Keybindings Registration
 *
 * All game.settings.register() and game.keybindings.register() calls
 * should be made here, invoked once during the "init" hook.
 */

import { NWO } from "./config.mjs";

/**
 * Register all module settings and keybindings.
 * Called from the main entry point during the "init" hook.
 */
export function registerSettings() {
  _registerCoreSettings();
  _registerKeybindings();
}

/* ----------------------------------------- */
/*  Core Settings                            */
/* ----------------------------------------- */

function _registerCoreSettings() {

  // --- Module Enabled ---
  game.settings.register(NWO.ID, NWO.SETTINGS.ENABLED, {
    name: `${NWO.I18N}.Settings.Enabled.Name`,
    hint: `${NWO.I18N}.Settings.Enabled.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      console.log(`${NWO.ID} | Module ${value ? "enabled" : "disabled"}`);
    },
  });

  // --- Debug Mode ---
  game.settings.register(NWO.ID, NWO.SETTINGS.DEBUG, {
    name: `${NWO.I18N}.Settings.Debug.Name`,
    hint: `${NWO.I18N}.Settings.Debug.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      CONFIG.debug[NWO.ID] = value;
    },
  });

  // --- Welcome Shown (client) ---
  game.settings.register(NWO.ID, NWO.SETTINGS.WELCOME_SHOWN, {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });
}

/* ----------------------------------------- */
/*  Keybindings                              */
/* ----------------------------------------- */

function _registerKeybindings() {
  // Example: Register a keybinding for opening the module's main panel
  // game.keybindings.register(NWO.ID, "openPanel", {
  //   name: `${NWO.I18N}.Keybindings.OpenPanel.Name`,
  //   hint: `${NWO.I18N}.Keybindings.OpenPanel.Hint`,
  //   editable: [{ key: "KeyN", modifiers: ["Alt"] }],
  //   onDown: () => { ... },
  //   precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  // });
}