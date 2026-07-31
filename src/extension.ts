import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let treeView: vscode.TreeView<vscode.TreeItem>;
let updateInterval: ReturnType<typeof setInterval>;
let wasPeakHour: boolean | null = null;

function isPeakHour(): boolean {
    const hour = new Date().getUTCHours();
    return (hour >= 1 && hour < 4) || (hour >= 6 && hour < 10);
}

class TimeAlertProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): vscode.TreeItem[] {
        const now = new Date();
        const hour = now.getUTCHours();
        const minute = now.getUTCMinutes();
        const peak = isPeakHour();

        const timeItem = new vscode.TreeItem(
            `UTC Time: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            vscode.TreeItemCollapsibleState.None
        );
        timeItem.iconPath = new vscode.ThemeIcon('clock');
        timeItem.description = 'Current UTC';

        const statusItem = new vscode.TreeItem(
            peak ? '⚠️ Peak Hour' : '✅ Normal Hour',
            vscode.TreeItemCollapsibleState.None
        );
        statusItem.iconPath = peak
            ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.red'))
            : new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        statusItem.description = peak ? '🔴 Heavy load period' : '🟢 All clear';

        const peakInfo = new vscode.TreeItem(
            'Peak windows: 01:00–04:00 & 06:00–10:00 UTC',
            vscode.TreeItemCollapsibleState.None
        );
        peakInfo.iconPath = new vscode.ThemeIcon('info');
        peakInfo.description = 'Info';

        return [timeItem, statusItem, peakInfo];
    }
}

function updateTreeViewAppearance(): void {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const peak = isPeakHour();

    if (peak) {
        treeView.badge = { value: 1, tooltip: 'Peak Hour Active — 01:00–04:00 & 06:00–10:00 UTC' };
        treeView.description = `🔴 PEAK — ${timeStr} UTC`;
    } else {
        treeView.badge = undefined;
        treeView.description = `🟢 Normal — ${timeStr} UTC`;
    }
}

function updateStatusBar(): void {
    const now = new Date();
    const peak = isPeakHour();

    if (peak) {
        statusBarItem.text = "$(warning) Peak Hour";
        statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else {
        statusBarItem.text = "$(check) Normal Hour";
        statusBarItem.color = new vscode.ThemeColor('terminal.ansiGreen');
        statusBarItem.backgroundColor = undefined;
    }
    statusBarItem.show();

    // Notify on transition into peak hour
    if (peak && wasPeakHour === false) {
        const hour = now.getUTCHours();
        const minute = now.getUTCMinutes();
        vscode.window.showInformationMessage(
            `Peak hour started! Current UTC: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
    }

    wasPeakHour = peak;
}

export function activate(context: vscode.ExtensionContext) {
    // Sidebar tree view
    const timeAlertProvider = new TimeAlertProvider();
    treeView = vscode.window.createTreeView('time-alert.statusView', {
        treeDataProvider: timeAlertProvider
    });
    context.subscriptions.push(treeView);

    // Status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'time-alert.showStatus';
    context.subscriptions.push(statusBarItem);

    // Initial update and then refresh every 60 seconds
    updateStatusBar();
    updateTreeViewAppearance();
    timeAlertProvider.refresh();
    updateInterval = setInterval(() => {
        updateStatusBar();
        updateTreeViewAppearance();
        timeAlertProvider.refresh();
    }, 60000);

    // If VS Code was opened during a peak hour, notify immediately
    if (isPeakHour()) {
        const now = new Date();
        const hour = now.getUTCHours();
        const minute = now.getUTCMinutes();
        vscode.window.showInformationMessage(
            `Peak hour! Current UTC: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
    }

    // Register a command that shows detailed info when the status bar item is clicked
    const disposable = vscode.commands.registerCommand('time-alert.showStatus', () => {
        const now = new Date();
        const hour = now.getUTCHours();
        const minute = now.getUTCMinutes();
        const peak = isPeakHour();
        vscode.window.showInformationMessage(
            `Current UTC: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} — ${peak ? '🔴 Peak Hour' : '🟢 Normal Hour'}`
        );
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}
