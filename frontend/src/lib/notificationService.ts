import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationPayload {
  title: string;
  body: string;
  id?: number;
  scheduleAt?: Date;
}

export const IPL_NOTIFICATION_POOL = [
  {
    title: "🏏 Match Day Alert: War Room Ready",
    body: "Toss is imminent! Review pitch conditions and set your Bat-First or Bowl-First tactical XI.",
  },
  {
    title: "⚡ Death Overs Alert",
    body: "Tight finish in the simulator! 26 needed off 12 balls. Call your tactical impact finisher!",
  },
  {
    title: "🔥 Form Surge Alert",
    body: "Virat Kohli scored 84*(48) with 175 SR! Form rating upgraded (+8% timing bonus).",
  },
  {
    title: "🧢 Orange Cap Leaderboard Shakeup",
    body: "Cap changes hands! Leading tournament run-scorer hits 412 runs with 162 strike rate.",
  },
  {
    title: "🧢 Purple Cap Battle",
    body: "Express seamer bagged 4/19 in death overs! Joint-leader in the tournament purple cap race.",
  },
  {
    title: "🚨 Strategic Impact Player Ready",
    body: "12th Man warmed up in the dugout. You have full GM control to sub any player at any over!",
  },
  {
    title: "💰 Mega Auction Hammer Buzz",
    body: "Consensus projection for premium wicketkeepers crossed ₹22 Cr! Check your franchise purse.",
  },
  {
    title: "🎯 Trade Desk Rumor",
    body: "Rival franchise scouting death seamers ahead of the trade window deadline. Bench valuation updated.",
  },
  {
    title: "🏟️ Chepauk Pitch Report",
    body: "Friction index elevated to 0.94. Surface favors finger & mystery spinners (+25% turn boost).",
  },
  {
    title: "🏟️ Wankhede Surface Update",
    body: "Heavy evening dew forecast. Second innings ball skid elevated — high chasing advantage!",
  },
  {
    title: "👑 Right to Match (RTM) Triggered",
    body: "Franchise war room exercises RTM card on the auction floor! High-stakes bidding battle underway.",
  },
  {
    title: "⚡ Seam Bowling Masterclass",
    body: "Jasprit Bumrah bowled 18 dot balls in a 4-over spell. Economy restricted to 4.25!",
  },
  {
    title: "📊 Points Table Squeeze",
    body: "Just 2 points separate 2nd and 5th spot in the race for Qualifier 1! Every net run rate point counts.",
  },
  {
    title: "🏆 Playoff Bracket Update",
    body: "Knockout lineup confirmed! Top 4 franchises advance to Qualifier 1 and the Eliminator.",
  },
  {
    title: "❄️ Tactical GM Advisory",
    body: "Middle-order anchor in a 2-game slump (-5% timing). Consider rotating bench reserves.",
  },
  {
    title: "🚀 Powerplay Carnage",
    body: "78 runs scored in the first 6 overs! High boundary clearance track reward aggression.",
  },
  {
    title: "🧤 Wicketkeeper Glovework",
    body: "Lightning stumping in 0.08 seconds! Wicketkeeper synergy bonus active in today's fixture.",
  },
  {
    title: "📈 Dynamic Franchise Valuation",
    body: "Franchise tactical rating increased to S+ Elite following consecutive tournament victories!",
  },
];

/**
 * Creates the Android notification channel with high priority so notifications pop up as heads-up banners on phone.
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.createChannel({
        id: 'ipl_alerts',
        name: 'IPL GM Match & Franchise Alerts',
        description: 'Random match updates, trade desk rumors, auction alerts and fortress pitch intel',
        importance: 4, // High importance for heads-up popup & sound
        visibility: 1, // Public visibility on lockscreen
        sound: 'beep.wav',
        vibration: true,
        lights: true,
        lightColor: '#f59e0b',
      });
      console.log('IPL notification channel created successfully.');
    } catch (err) {
      console.warn('Channel creation error (may already exist):', err);
    }
  }
}

/**
 * Requests notification permission across Native Android/iOS and Web.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      await setupNotificationChannels();
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return true;
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err);
  }
  return false;
}

/**
 * Immediately triggers a sample notification (within 1 second) to test on phone.
 */
export async function triggerInstantSampleNotification(customTitle?: string, customBody?: string) {
  const granted = await requestNotificationPermission();
  const item = IPL_NOTIFICATION_POOL[Math.floor(Math.random() * IPL_NOTIFICATION_POOL.length)];
  const title = customTitle || item.title;
  const body = customBody || item.body;
  const id = Math.floor(Math.random() * 100000) + 1;

  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 1000) },
            channelId: 'ipl_alerts',
            sound: 'beep.wav',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      return { status: 'scheduled_native', title, body };
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (granted || Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
        return { status: 'triggered_web', title, body };
      }
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
  return { status: 'unsupported_or_denied', title, body };
}

/**
 * Schedules random IPL notifications sent to the phone from time to time randomly.
 * Clears old pending notifications and queues 10-12 random alerts spaced over the next 3 days.
 */
export async function scheduleRandomDailyNotifications(): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.warn('Notifications permission not granted.');
    return false;
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Cancel previous pending notifications to avoid duplicate buildup
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications && pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      } catch (e) {
        console.warn('Failed to clear pending notifications:', e);
      }

      // 2. Build 10 random notification intervals (from 20 mins to 72 hours)
      // Spaced randomly throughout the day and evening
      const intervalsMinutes = [
        Math.floor(Math.random() * 20) + 15,     // 15 - 35 mins
        Math.floor(Math.random() * 60) + 90,     // 1.5 - 2.5 hours
        Math.floor(Math.random() * 90) + 240,    // 4 - 5.5 hours
        Math.floor(Math.random() * 120) + 480,   // 8 - 10 hours
        Math.floor(Math.random() * 180) + 840,   // 14 - 17 hours
        Math.floor(Math.random() * 240) + 1320,  // 22 - 26 hours
        Math.floor(Math.random() * 300) + 1920,  // 32 - 37 hours
        Math.floor(Math.random() * 360) + 2640,  // 44 - 50 hours
        Math.floor(Math.random() * 420) + 3480,  // 58 - 65 hours
        Math.floor(Math.random() * 480) + 4200,  // 70 - 78 hours
      ];

      // Shuffle pool so notifications are varied
      const shuffledPool = [...IPL_NOTIFICATION_POOL].sort(() => 0.5 - Math.random());

      const notificationsToSchedule = intervalsMinutes.map((mins, idx) => {
        const item = shuffledPool[idx % shuffledPool.length];
        const scheduledTime = new Date(Date.now() + mins * 60 * 1000);
        return {
          title: item.title,
          body: item.body,
          id: 5000 + idx,
          channelId: 'ipl_alerts',
          schedule: { at: scheduledTime },
          sound: 'beep.wav',
        };
      });

      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      console.log(`[NotificationService] Scheduled ${notificationsToSchedule.length} random IPL notifications over the next 72 hours!`);
      return true;
    } else {
      console.log('[NotificationService] Running on web. Local notifications active.');
      return true;
    }
  } catch (err) {
    console.error('Failed to schedule random notifications:', err);
    return false;
  }
}
