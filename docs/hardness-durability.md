# Hardness & Durability — Equipment Item Fields

## Overview

The **No Way Out! - 5e** module adds two hidden fields to D&D 5e equipment items:

| Field | Key | Type | Range | Default | Description |
|---|---|---|---|---|---|
| **Hardness** (Dureza) | `system.hardness` | Float | 0 – 2 | 1 | Material hardness rating. Represents how resistant the item's material is to damage. |
| **Durability** (Durabilidade) | `system.durability` | Float | 0 – 10 | 10 | Item durability rating. Represents the overall structural integrity of the item. |

These fields are **GM-only** — they are only visible and editable by users with the Game Master role. Players cannot see or modify these values on their equipment sheets.

---

## Data Model

### How It Works

The module extends the D&D 5e system's `EquipmentData` class by using a factory function (`createNWOEquipmentData`) that creates a subclass at runtime. This is necessary because `CONFIG.Item.dataModels.equipment` is only set during the D&D5e system's `init` hook, which fires before module init hooks. The factory function is called during the module's `init` hook, after the system has registered its data models, and the resulting `NWOEquipmentData` class replaces the base `EquipmentData` in `CONFIG.Item.dataModels.equipment`.

This means:

- **All existing equipment items** automatically gain the new fields with their default values.
- **No new item sub-type is created** — the standard `equipment` type is enhanced in place.
- **Schema validation** is fully supported — values are clamped to their min/max ranges.
- **The `formField` helper** works natively with the new fields, providing proper input rendering.

### Schema Definition

```javascript
hardness: new NumberField({
  required: true,
  nullable: false,
  integer: false,    // allows float values like 0.5, 1.7
  initial: 1,        // default hardness
  min: 0,
  max: 2,
  step: 0.1,
  label: "NWO.Fields.Hardness.Label",
  hint: "NWO.Fields.Hardness.Hint"
})

durability: new NumberField({
  required: true,
  nullable: false,
  integer: false,    // allows float values like 7.3, 9.5
  initial: 10,       // default durability
  min: 0,
  max: 10,
  step: 0.1,
  label: "NWO.Fields.Durability.Label",
  hint: "NWO.Fields.Durability.Hint"
})
```

### Data Migration

Legacy equipment items that do not have `hardness` or `durability` in their source data will automatically receive the default values (`1` and `10` respectively) through the schema's `initial` property and the `_migrateData` override in `NWOEquipmentData`.

---

## GM Usage

### Viewing & Editing

1. Open any **Equipment** item sheet as a GM.
2. Navigate to the **Details** tab.
3. At the bottom of the details section, you will see a fieldset labeled **"No Way Out — Hidden Fields"** (or **"No Way Out — Campos Ocultos"** in Portuguese).
4. Edit the **Hardness** and **Durability** values as needed. Values accept decimal numbers (e.g., `0.5`, `1.7`, `8.3`).
5. Changes are saved automatically (submit-on-change) or when you click the sheet's save button.

### Accessing Values Programmatically

```javascript
// Get hardness and durability from an equipment item
const item = await fromUuid("Item.xxx");
console.log(item.system.hardness);   // e.g., 1
console.log(item.system.durability);  // e.g., 10

// Update values
await item.update({
  "system.hardness": 1.5,
  "system.durability": 7.3
});
```

### Player Visibility

Players **cannot** see the hidden fields section. The template uses `{{#if isGM}}` to conditionally render the fieldset, ensuring that only GM users have access to these values. Players see the standard equipment sheet without any modifications.

---

## Technical Implementation

### Architecture

```
module/data/item/equipment-data.mjs    → createNWOEquipmentData factory function
module/data/_module.mjs                → Barrel export
module/no-way-out.mjs                  → Registers data model + preloads partial
module/config.mjs                      → NWO.FIELDS, NWO.DEFAULTS constants
templates/items/details/nwo-details-equipment.hbs  → GM-only fieldset partial
lang/en.json                           → English labels & hints
lang/pt-BR.json                        → Portuguese labels & hints
styles/no-way-out.css                  → .nwo-hidden-fields styling
```

### Registration Flow

1. **`init` hook** fires → `_registerConfig()` calls `createNWOEquipmentData(CONFIG.Item.dataModels.equipment)` and replaces `CONFIG.Item.dataModels.equipment` with the resulting `NWOEquipmentData` class.
2. **`init` hook** fires → `_preloadPartials()` registers the `nwo.details-equipment-nwo` Handlebars partial.
3. When an equipment item sheet renders, `NWOEquipmentData.getSheetData()` pushes `"nwo.details-equipment-nwo"` into `context.parts`.
4. The `details.hbs` template iterates over `parts` and renders each partial, including the NWO one.

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Subclass via factory function | `CONFIG.Item.dataModels.equipment` is only available after system `init` hook, so we use a factory function to create the subclass at the right time |
| Replace `CONFIG.Item.dataModels.equipment` | All equipment items get fields automatically; no new sub-type needed |
| GM-only visibility | Fields are "hidden" from players per the feature requirement |
| Float fields (`integer: false`) | Allows granular values like 0.5, 1.7, 7.3 |
| `_migrateData` override | Explicit handling of legacy items without these fields |

### Scope

Currently, Hardness and Durability are only added to **Equipment** items. Other item types (weapons, consumables, tools, etc.) are not affected. This can be extended in the future by creating similar subclasses for other item types.

---

## Localization

| Key | English | Português (Brasil) |
|---|---|---|
| `NWO.Fields.Hardness.Label` | Hardness | Dureza |
| `NWO.Fields.Hardness.Hint` | Material hardness rating (0–2). Default: 1. | Classificação de dureza do material (0–2). Padrão: 1. |
| `NWO.Fields.Durability.Label` | Durability | Durabilidade |
| `NWO.Fields.Durability.Hint` | Item durability rating (0–10). Default: 10. | Classificação de durabilidade do item (0–10). Padrão: 10. |
| `NWO.Equipment.HiddenFields` | No Way Out — Hidden Fields | No Way Out — Campos Ocultos |