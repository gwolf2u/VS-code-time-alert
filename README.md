# Time Alert

A VS Code extension that monitors the current UTC time and alerts you when it's peak hour.

## Features

- **Status bar indicator** — Red background with "⚠️ Peak Hour" text during peak times, green "✅ Normal Hour" otherwise
- **Sidebar view** — Activity bar icon with a badge bubble during peak hours; red/green colored icons and descriptions in the tree view
- **Sidebar banner** — Warning message appears above the tree items during peak hours
- **Peak hour notifications** — An alert pops up when the clock crosses into a peak hour, or if you open VS Code during one
- **One-click info** — Click the status bar item to see the exact current UTC time and status
- **Auto-refresh** — Checks every 60 seconds so you never miss a transition

## Peak Hours (UTC)

| Start | End   |
|-------|-------|
| 01:00 | 04:00 |
| 06:00 | 10:00 |

All other times are considered normal hours.

## Release Notes

### 1.0.4

- Peak hours now only apply on weekdays (Monday–Friday); weekends are always normal hours

### 1.0.3

- Added sidebar activity bar badge indicator during peak hours
- Added red/green colored theme icons in the tree view
- Added sidebar banner message and dynamic description text
- Improved visual distinction between peak and normal hours in the sidebar

### 1.0.2

- Added sidebar tree view with UTC clock and peak hour status
- Added button to open Time Alert sidebar view

### 1.0.1

- Initial release

**Enjoy!**
