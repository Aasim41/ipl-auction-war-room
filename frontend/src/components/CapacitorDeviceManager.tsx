'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function CapacitorDeviceManager() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1. Lock Screen Orientation to Landscape on Mobile/Capacitor
    const lockLandscape = async () => {
      try {
        const { ScreenOrientation } = await import('@capacitor/screen-orientation')
        await ScreenOrientation.lock({ orientation: 'landscape' })
      } catch {
        // Ignored on standard browsers or unaccelerated web environments
      }
    }
    lockLandscape()

    // 2. Android Hardware Back Button listener
    let backListenerHandle: any = null
    const setupBackButton = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app')
        backListenerHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const currentPath = window.location.pathname
          if (currentPath === '/' || currentPath === '/select-team') {
            CapApp.exitApp()
          } else if (currentPath === '/playing-xi') {
            router.push('/auction')
          } else if (currentPath === '/auction') {
            router.push('/squad')
          } else if (currentPath === '/squad') {
            router.push('/trade')
          } else if (currentPath === '/trade') {
            router.push('/')
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
    setupBackButton()

    return () => {
      if (backListenerHandle && typeof backListenerHandle.remove === 'function') {
        backListenerHandle.remove()
      }
    }
  }, [router, pathname])

  return null
}
