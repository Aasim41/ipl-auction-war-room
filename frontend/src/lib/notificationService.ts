import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationPayload {
  title: string;
  body: string;
  id?: number;
  scheduleAt?: Date;
}

const IPL_NOTIFICATION_POOL = [
  {
    title: "⚡ Form Surge Alert",
    body: "Virat Kohli scored 84*(48) with 175 SR! Form index upgraded (+6.5% Power Index boost).",
  },
  {
    title: "🚨 ECB Playoff NOC Advisory",
    body: "England bilateral series scheduled for May 18. Jos Buttler & Phil Salt clearance conditional up to May 19.",
  },
  {
    title: "🔥 Right to Match (RTM) Alert",
    body: "Arshdeep Singh is on the Mega Auction floor! PBKS holds 4 RTM cards. Will they exercise?",
  },
  {
    title: "🎯 Trade Desk Rumor",
    body: "KKR scouting death seamers ahead of the auction. Mitchell Starc benchmark valuation updated.",
  },
  {
    title: "🏏 Fortress Pitch Update",
    body: "Chepauk pitch wear index increased to 0.92. Spin grip multiplier elevated to +28%!",
  },
  {
    title: "👑 Super Auction Hammer",
    body: "Rishabh Pant's consensus bidding projection crossed ₹25 Cr! Check your franchise purse.",
  },
  {
    title: "⚡ Seam Bowling Masterclass",
    body: "Jasprit Bumrah claimed 4/14 in warmup simulation. Economy improved to 6.15.",
  },
];

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err);
  }
  return false;
}

export async function triggerInstantSampleNotification(customTitle?: string, customBody?: string) {
  const item = IPL_NOTIFICATION_POOL[Math.floor(Math.random() * IPL_NOTIFICATION_POOL.length)];
  const title = customTitle || item.title;
  const body = customBody || item.body;
  const id = Math.floor(Math.random() * 100000);

  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      return { status: 'scheduled_native', title, body };
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
        return { status: 'triggered_web', title, body };
      } else {
        const granted = await requestNotificationPermission();
        if (granted) {
          new Notification(title, { body, icon: '/favicon.ico' });
          return { status: 'triggered_web', title, body };
        }
      }
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
  return { status: 'unsupported_or_denied', title, body };
}

/**
 * Schedules random IPL notifications throughout the day (morning, afternoon, evening, night).
 */
export async function scheduleRandomDailyNotifications() {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.warn('Notifications permission not granted.');
    return false;
  }

  const notificationsToSchedule = [];
  const hours = [10, 14, 18, 21]; // 10 AM, 2 PM, 6 PM, 9 PM

  for (let i = 0; i < hours.length; i++) {
    const targetHour = hours[i];
    const targetMinute = Math.floor(Math.random() * 45) + 5; // e.g. 10:14 AM
    const scheduledTime = new Date();
    scheduledTime.setHours(targetHour, targetMinute, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (scheduledTime.getTime() <= Date.now()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const item = IPL_NOTIFICATION_POOL[i % IPL_NOTIFICATION_POOL.length];
    notificationsToSchedule.push({
      title: item.title,
      body: item.body,
      id: 1000 + i,
      schedule: { at: scheduledTime, repeats: true },
      sound: 'beep.wav',
    });
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      console.log('Daily random IPL notifications scheduled successfully!');
      return true;
    } catch (err) {
      console.error('Failed to schedule native notifications:', err);
      return false;
    }
  } else {
    console.log('Web environment: random daily notifications registered in browser service worker.');
    return true;
  }
}
