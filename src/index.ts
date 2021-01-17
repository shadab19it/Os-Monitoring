import electron, { app, BrowserWindow, Menu, Tray, ipcMain, Notification } from "electron";
import AutoLaunch from "auto-launch";
import path from "path";
import { ManOutlined } from "@ant-design/icons";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}
// assigne some global varialbe
let mainWindow: Electron.BrowserWindow | null;
let tray: Electron.Tray | null;
let MenuTemplate: Electron.Menu | null;
let autoLaunch: AutoLaunch | null;
let isAutoLaunch: boolean = true;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.send("auto-launch", isAutoLaunch);

  autoLaunch = new AutoLaunch({
    name: "Monitor-App",
    path: app.getPath("exe"),
  });
  if (isAutoLaunch) {
    autoLaunch.enable();
  }

  ipcMain.on("auto-launch", (e, v) => {
    isAutoLaunch = v;
    isAutoLaunch ? autoLaunch.enable() : autoLaunch.disable();
  });

  mainWindow.on("close", () => {
    mainWindow = null;
    tray = null;
  });
};

function showNotification() {
  const notification = {
    icon: "./src/tray.png",
    title: "Monitoring App open now",
    body: "You can watch you os info Now .",
  };
  new Notification(notification).show();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", createWindow);

app
  .whenReady()
  .then(() => {
    showNotification();
    ipcMain.on("app_version", () => {
      mainWindow.webContents.send("app_version", app.getVersion());
    });

    tray = new Tray("./src/tray.png");
    const cxtMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        type: "normal",
        click: () => {
          app.quit();
        },
      },
      {
        label: "Auto-launch",
        checked: isAutoLaunch,
        type: "checkbox",
        click: (e) => {
          isAutoLaunch = e.checked;
          isAutoLaunch ? autoLaunch.enable() : autoLaunch.disable();
        },
      },
      {
        label: "Setting",
        type: "checkbox",
      },
      {
        label: "About",
        type: "normal",
        click: (e) => {
          console.log("about click");
        },
      },
    ]);
    tray?.setToolTip(`Monitor App`);
    tray.setContextMenu(cxtMenu);
    tray.on("click", () => {
      mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show();
    });

    console.log("global main ", isAutoLaunch);
  })
  .catch((err) => console.log(err));

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    mainWindow = null;
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
