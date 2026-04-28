/**
 * No Way Out! - 5e
 * Module Configuration Constants
 *
 * Central place for all module-wide configuration values.
 * Import NWO from here whenever you need the module ID, paths, or flags.
 */

/**
 * The core configuration object for the No Way Out! module.
 * @readonly
 */
export const NWO = Object.freeze({

  /** Module ID — must match the `id` field in module.json */
  ID: "no-way-out-5e",

  /** Human-readable module label */
  LABEL: "No Way Out! - 5e",

  /** Module version — kept in sync with module.json */
  VERSION: "1.0.0",

  /** Minimum Foundry VTT version */
  MIN_FOUNDRY: "14",

  /** Verified Foundry VTT version */
  VERIFIED_FOUNDRY: "14",

  /* ----------------------------------------- */
  /*  Paths                                    */
  /* ----------------------------------------- */

  PATHS: Object.freeze({
    /** Root path for module templates */
    templates: "modules/no-way-out-5e/templates",

    /** Root path for module assets */
    assets: "modules/no-way-out-5e/assets",
  }),

  /* ----------------------------------------- */
  /*  Flags                                    */
  /* ----------------------------------------- */

  FLAGS: Object.freeze({
    /** Scope used for module flags on documents */
    scope: "no-way-out-5e",

    /** Flag keys */
    enabled: "enabled",
    version: "version",
  }),

  /* ----------------------------------------- */
  /*  Settings Keys                            */
  /* ----------------------------------------- */

  SETTINGS: Object.freeze({
    /** Whether the module's core features are enabled */
    ENABLED: "nwo-enabled",

    /** Debug mode toggle */
    DEBUG: "nwo-debug",

    /** Welcome message shown on first launch */
    WELCOME_SHOWN: "nwo-welcome-shown",
  }),

  /* ----------------------------------------- */
  /*  i18n Key Prefix                          */
  /* ----------------------------------------- */

  /** Prefix for all i18n keys — use as `NWO.I18N + ".SomeKey"` */
  I18N: "NWO",

  /* ----------------------------------------- */
  /*  Equipment Field Keys                     */
  /* ----------------------------------------- */

  FIELDS: Object.freeze({
    /** Key for the hardness field on equipment items */
    HARDNESS: "hardness",

    /** Key for the durability field on equipment items */
    DURABILITY: "durability",
  }),

  /* ----------------------------------------- */
  /*  Equipment Default Values                 */
  /* ----------------------------------------- */

  DEFAULTS: Object.freeze({
    /** Default hardness value for equipment (0–2 scale) */
    HARDNESS: 1,

    /** Default durability value for equipment (0–10 scale) */
    DURABILITY: 10,
  }),
});