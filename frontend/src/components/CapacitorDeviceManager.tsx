'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { lockOrientation } from '../lib/orientationManager'
import { setupNotificationChannels, scheduleRandomDailyNotifications } from '../lib/notificationService'

export function CapacitorDeviceManager() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1. Maintain Portrait orientation across franchise war rooms and simulation arena
    lockOrientation('portrait')

    // 2. Initialize native push notification channel and schedule random IPL alerts to the phone
    const initNotifications = async () => {
      try {
        await setupNotificationChannels()
        await scheduleRandomDailyNotifications()
      } catch (e) {
        console.warn('[CapacitorDeviceManager] Notification scheduling error:', e)
      }
    }
    initNotifications()

    // 3. App Lifecycle & Back Button listeners
    let backListenerHandle: any = null
    let appStateListenerHandle: any = null

    const setupAppListeners = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app')
        
        // Listen to app backgrounding / foregrounding to refresh scheduled random notifications
        appStateListenerHandle = await CapApp.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            // App went to background / screen turned off: ensure random alerts are queued into the future
            scheduleRandomDailyNotifications()
          }
        })

        // Android Hardware Back Button listener
        backListenerHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const currentPath = window.location.pathname
          if (currentPath === '/' || currentPath === '/select-team' || currentPath === '/playing-xi') {
            CapApp.exitApp()
          } else if (currentPath === '/trophies' || currentPath === '/stats' || currentPath === '/win-prob' || currentPath === '/hub') {
            router.push('/playing-xi')
          } else if (currentPath === '/auction') {
            router.push('/squad')
          } else if (currentPath === '/squad') {
            router.push('/trade')
          } else if (currentPath === '/trade') {
            router.push('/select-team')
          } else if (canGoBack) {
            window.history.back()
          } else {
            CapApp.exitApp()
          }
        })
      } catch {
        // Not native Capacitor environment
      }
    }
    setupAppListeners()

    return () => {
      if (backListenerHandle && typeof backListenerHandle.remove === 'function') {
        backListenerHandle.remove()
      }
      if (appStateListenerHandle && typeof appStateListenerHandle.remove === 'function') {
        appStateListenerHandle.remove()
      }
    }
  }, [router, pathname])

  return null
}
