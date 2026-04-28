/**
 * No Way Out! - 5e
 * Hook Registrations
 *
 * Centralized place for all Hooks.on() and Hooks.once() registrations.
 * Called once during the "init" hook from the main entry point.
 */

import { NWO } from "./config.mjs";

/**
 * Register all module hooks.
 * Called from the main entry point during the "init" hook.
 */
export function registerHooks() {
  // --- Ready Hook ---
  Hooks.on("ready", _onReady);

  // --- Render Application Hooks ---
  // Hooks.on("renderActorSheet5e", _onRenderActorSheet);

  // --- Document Lifecycle Hooks ---
  // Hooks.on("createActor", _onCreateActor);
  // Hooks.on("updateActor", _onUpdateActor);
  // Hooks.on("deleteActor", _onDeleteActor);

  // --- Chat Message Hooks ---
  // Hooks.on("createChatMessage", _onCreateChatMessage);

  // --- Combat Hooks ---
  // Hooks.on("updateCombat", _onUpdateCombat);
  // Hooks.on("endCombat", _onEndCombat);
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