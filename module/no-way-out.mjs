/**
 * No Way Out! - 5e
 * FoundryVTT v14 Module — Main Entry Point
 *
 * This is the primary esmodule loaded by FoundryVTT.
 * It initializes the module namespace, registers settings, hooks, and
 * prepares all submodules.
 */

import { NWO } from "./config.mjs";
import { registerSettings } from "./settings.mjs";
import { registerHooks } from "./hooks.mjs";
import * as applications from "./applications/_module.mjs";
import * as data from "./data/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as utils from "./utils/_module.mjs";
import { createNWOEquipmentData } from "./data/_module.mjs";

/* ----------------------------------------- */
/*  Module Namespace                         */
/* ----------------------------------------- */

globalThis.noWayOut = {
  applications,
  config: NWO,
  data,
  documents,
  utils,
};

/* ----------------------------------------- */
/*  Initialization                           */
/* ----------------------------------------- */

Hooks.once("init", () => {
  console.log(`${NWO.ID} | Initializing No Way Out! - 5e`);

  // Expose on game module
  game.modules.get(NWO.ID).api = globalThis.noWayOut;

  // Register settings & keybindings
  registerSettings();

  // Register all module hooks
  registerHooks();

  // Register custom CONFIG values
  _registerConfig();

  // Preload Handlebars partials
  _preloadPartials();

  console.log(`${NWO.ID} | Initialization complete`);
});

Hooks.on("ready", () => {
  console.log(`${NWO.ID} | Ready`);

  // Initialize UI components and module data
  _onReady();
});

/* ----------------------------------------- */
/*  Internal Helpers                         */
/* ----------------------------------------- */

/**
 * Register custom CONFIG values for the module.
 * @private
 */
function _registerConfig() {
  // Create the extended Equipment data model by subclassing the system's EquipmentData.
  // This must happen after the D&D5e system has registered its data models in CONFIG.
  const BaseEquipmentData = CONFIG.Item.dataModels.equipment;
  if ( BaseEquipmentData ) {
    const NWOEquipmentData = createNWOEquipmentData(BaseEquipmentData);
    CONFIG.Item.dataModels.equipment = NWOEquipmentData;
    console.log(`${NWO.ID} | Registered extended Equipment data model`);
  } else {
    console.error(`${NWO.ID} | Could not find base EquipmentData in CONFIG.Item.dataModels`);
  }
}

/**
 * Preload Handlebars partials for the module.
 * Partials are registered with a key derived from the file name,
 * e.g. "nwo.details-equipment-nwo" for nwo-details-equipment.hbs.
 * @private
 */
function _preloadPartials() {
  const partials = {
    "nwo.details-equipment-nwo": `modules/${NWO.ID}/templates/items/details/nwo-details-equipment.hbs`
  };
  foundry.applications.handlebars.loadTemplates(partials);
  console.log(`${NWO.ID} | Preloaded ${Object.keys(partials).length} partials`);
}

/**
 * Perform post-ready initialization.
 * @private
 */
function _onReady() {
  // Initialize UI, render welcome message, etc.
}