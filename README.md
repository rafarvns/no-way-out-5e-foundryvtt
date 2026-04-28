# No Way Out! - 5e

> A FoundryVTT v14 module that makes D&D 5e more lethal and challenging.

**No Way Out! - 5e** is a homebrew module for Foundry Virtual Tabletop that introduces modified rules, enhanced danger mechanics, and deadly encounters to the 5th edition of the world's greatest roleplaying game.

---

## Features

- 🗡️ **Lethal Combat** — Modified rules for grittier, deadlier combat encounters
- 💀 **Danger Mechanics** — Enhanced critical hits, exhaustion, and injury systems
- 🎲 **Custom Tables** — Roll tables for critical fumbles, injuries, and environmental hazards
- 📜 **Rule Overrides** — Configurable homebrew rules that integrate with the dnd5e system
- 🌍 **Multi-language** — English and Portuguese (Brazil) supported out of the box

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Foundry VTT | 14+ |
| D&D 5e System (dnd5e) | Latest |

---

## Installation

### Method 1: FoundryVTT Package Browser

1. Open FoundryVTT
2. Go to **Add-on Modules** → **Install Module**
3. Search for **"No Way Out! - 5e"**
4. Click **Install**

### Method 2: Manifest URL

1. Open FoundryVTT
2. Go to **Add-on Modules** → **Install Module**
3. Paste the manifest URL:
   ```
   https://github.com/rafarvns/no-way-out/releases/latest/download/module.json
   ```
4. Click **Install**

### Method 3: Manual (Development)

1. Clone this repository into your FoundryVTT `Data/modules/` directory:
   ```bash
   cd <your-foundry-data>/Data/modules/
   git clone https://github.com/rafarvns/no-way-out.git no-way-out-5e
   ```
2. Restart FoundryVTT
3. Enable the module in your **Game Settings** → **Manage Modules**

---

## Project Structure

```
no-way-out-5e/
├── module.json                  # Module manifest (FoundryVTT)
├── package.json                 # Node.js package configuration
├── README.md                    # This file
├── .gitignore                   # Git ignore rules
│
├── module/                      # Source code (ES Modules)
│   ├── no-way-out.mjs           # Main entry point — registers hooks, settings, namespace
│   ├── config.mjs               # Configuration constants (NWO object)
│   ├── settings.mjs             # Game settings & keybindings registration
│   ├── hooks.mjs                # Centralized hook registrations
│   ├── applications/            # ApplicationV2 / DialogV2 / DocumentSheetV2 classes
│   │   └── _module.mjs          # Barrel export
│   ├── data/                    # TypeDataModel subclasses
│   │   └── _module.mjs          # Barrel export
│   ├── documents/               # Custom Document classes
│   │   └── _module.mjs          # Barrel export
│   └── utils/                   # Utility functions & helpers
│       └── _module.mjs          # Barrel export
│
├── templates/                   # Handlebars templates (.hbs)
│   ├── apps/                    # Application sheet templates
│   ├── chat/                    # Chat message card templates
│   └── shared/                  # Reusable partial templates
│
├── styles/                      # Stylesheets
│   └── no-way-out.css           # Module styles with CSS custom properties
│
├── lang/                        # Localization files (i18n)
│   ├── en.json                  # English
│   └── pt-BR.json               # Portuguese (Brazil)
│
├── packs/                       # Compendium packs (LevelDB — gitignored)
│   ├── rules/                   # Journal entries with rule descriptions
│   ├── tables/                  # Roll tables for injuries, fumbles, etc.
│   └── macros/                  # Utility macros
│
├── assets/                      # Static assets
│   └── icons/                   # Custom icons
│
└── tools/                       # Development & utility scripts
    └── scrape-foundry-api.js    # API documentation scraper
```

---

## Configuration

After enabling the module, configure it via **Game Settings** → **Configure Settings** → **No Way Out! - 5e**:

| Setting | Scope | Default | Description |
|---------|-------|---------|-------------|
| Enable Module | World | ✅ | Master toggle for all module features |
| Debug Mode | World | ❌ | Enable verbose console logging |

---

## Development

### Setup

```bash
# Install dependencies
npm install

# Link to FoundryVTT (adjust path to your installation)
# Windows (PowerShell):
New-Item -ItemType SymbolicLink -Path "<FoundryData>\Data\modules\no-way-out-5e" -Target "$PWD"
```

### Architecture

- **Entry Point**: `module/no-way-out.mjs` — loaded as an ES module by FoundryVTT
- **Namespace**: `globalThis.noWayOut` / `game.modules.get("no-way-out-5e").api`
- **i18n Prefix**: `NWO` — all localization keys are under the `NWO` namespace
- **CSS Prefix**: `nwo-` — all CSS classes are prefixed with `nwo-`

### Adding New Features

1. **New Application Sheet**: Create a class in `module/applications/`, export it from `_module.mjs`
2. **New Data Model**: Create a `TypeDataModel` subclass in `module/data/`, export from `_module.mjs`
3. **New Hook**: Add the handler in `module/hooks.mjs`
4. **New Setting**: Register it in `module/settings.mjs`
5. **New Template**: Add a `.hbs` file in the appropriate `templates/` subdirectory
6. **New i18n Key**: Add entries to both `lang/en.json` and `lang/pt-BR.json`

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Author

**flamolino**
- GitHub: [rafarvns](https://github.com/rafarvns)
- Discord: flamolino~
- Email: rafarvns@gmail.com