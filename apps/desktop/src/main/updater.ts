/**
 * updater.ts — auto-update via electron-updater (GitHub Releases)
 *
 * Call initUpdater() once after app is ready, in production only.
 * electron-builder publishes to: github.com/productvibe/manyclaw
 */

import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { dialog } from 'electron'

export function initUpdater(): void {
  autoUpdater.autoDownload = true
  autoUpdater.allowPrerelease = false

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('[updater] Update available:', info.version)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('[updater] Up to date:', info.version)
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(
      `[updater] Downloading ${progress.percent.toFixed(1)}% ` +
      `(${(progress.transferred / 1024 / 1024).toFixed(1)} / ${(progress.total / 1024 / 1024).toFixed(1)} MB)`,
    )
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[updater] Update downloaded:', info.version)

    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update ready',
        message: `ManyClaw ${info.version} is ready to install.`,
        detail: 'Restart now to apply the update, or install it the next time you launch the app.',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  autoUpdater.on('error', (err) => {
    console.error('[updater] Error:', err.message)
  })

  autoUpdater.checkForUpdatesAndNotify()
}
