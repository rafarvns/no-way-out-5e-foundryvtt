/**
 * No Way Out! - 5e
 * Hook Registrations
 *
 * Centralized place for all Hooks.on() and Hooks.once() registrations.
 * Called once during the "init" hook from the main entry point.
 */

import { NWO } from "./config.mjs";
import { getDurabilityState, getDurabilityColorClass } from "./utils/durability-state.mjs";

/**
 * Register all module hooks.
 * Called from the main entry point during the "init" hook.
 */
export function registerHooks() {
  // --- Ready Hook ---
  Hooks.on("ready", _onReady);

  // --- Render Application Hooks ---
  Hooks.on("renderItemSheet5e", _onRenderItemSheet);
}

/* ----------------------------------------- */
/*  Hook Handlers                            */
/* ----------------------------------------- */

/**
 * Handle the "ready" hook — runs after game data is fully loaded.
 * @private
 */
function _onReady() {
  // Show welcome message on first launch
  const welcomeShown = game.settings.get(NWO.ID, NWO.SETTINGS.WELCOME_SHOWN);
  if (!welcomeShown) {
    _showWelcomeMessage();
    game.settings.set(NWO.ID, NWO.SETTINGS.WELCOME_SHOWN, true);
  }
}

/**
 * Inject the NWO equipment condition section into the Description tab
 * of equipment item sheets.
 * @param {ApplicationV2} app      The rendered application.
 * @param {HTMLElement}    html     The rendered HTML element.
 * @param {object}         context  The template context data.
 * @private
 */
async function _onRenderItemSheet(app, html, context) {
  // Only apply to equipment items
  if ( app.item?.type !== "equipment" ) return;

  const item = app.item;
  const system = item.system;

  // Only proceed if the item has our extended data model
  if ( system.hardness == null && system.durability == null ) return;

  // Find the description tab content
  const descriptionTab = html.querySelector?.(".description.tab") ?? html.find?.(".description.tab")?.[0];
  if ( !descriptionTab ) return;

  // Build the context for the template
  const isGM = game.user.isGM;
  const durabilityStateText = getDurabilityState(system.durability);
  const durabilityColorClass = getDurabilityColorClass(system.durability);

  const templateContext = {
    item,
    isGM,
    durabilityStateText,
    durabilityColorClass,
    source: item._source.system,
    fields: system.constructor.schema.fields,
    partId: item.id
  };

  // Render the NWO template
  const nwoHtml = await foundry.applications.handlebars.renderTemplate(
    `modules/${NWO.ID}/templates/items/description/nwo-description-equipment.hbs`,
    templateContext
  );

  // Insert the rendered HTML at the top of the description tab
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = nwoHtml;
  const nwoElement = tempDiv.firstElementChild;

  if ( nwoElement ) {
    // Insert before the first child of the description tab
    const firstChild = descriptionTab.firstElementChild;
    if ( firstChild ) {
      descriptionTab.insertBefore(nwoElement, firstChild);
    } else {
      descriptionTab.appendChild(nwoElement);
    }
  }

  // Activate event listeners for the injected form fields (GM only)
  if ( isGM ) {
    app._activateCoreListeners(nwoElement);
  }
}

/**
 * Display a welcome chat message when the module is first activated.
 * @private
 */
function _showWelcomeMessage() {
  ChatMessage.create({
    user: game.user.id,
    content: `<div class="nwo-welcome">
      <h2>${game.i18n.localize(`${NWO.I18N}.Welcome.Title`)}</h2>
      <p>${game.i18n.localize(`${NWO.I18N}.Welcome.Message`)}</p>
    </div>`,
  });
}