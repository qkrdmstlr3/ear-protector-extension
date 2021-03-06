import * as chrome from '../chrome/index';
import Timer from './Timer';

class Background {
  stopTimer: Timer;
  alarmTimer: Timer;
  COUNT_MINUTE_UNIT: number = 1;
  LIMITED_MINUTE_UNIT: number = 60;
  INITIALIZE_TIMER_STANDARD_MINUTE: number = 10;

  constructor() {
    this.stopTimer = new Timer('stopTimer');
    this.alarmTimer = new Timer('alarmTimer');
    chrome.storage.set('checked', true);
    chrome.alarms.createAlarm(this.COUNT_MINUTE_UNIT);
    chrome.alarms.onAlarm.addListener(this.addAlarm.bind(this));
  }

  async addAlarm() {
    const audibleTabs = await chrome.tabs.getAllAudibleTab();
    const alarmTimerMinutes = await this.alarmTimer.getMinute();
    const stopTimerMinutes = await this.stopTimer.getMinute();

    chrome.action.setBadgeText({
      text: `${alarmTimerMinutes}`,
    });

    const isAlarm = alarmTimerMinutes && !(alarmTimerMinutes % this.LIMITED_MINUTE_UNIT);
    if (audibleTabs.length) {
      if (isAlarm) chrome.notifications.warn(alarmTimerMinutes);
      this.alarmTimer.increaseMinute();
      this.stopTimer.initializeMinute();
    }
    if (!audibleTabs.length) {
      if (stopTimerMinutes >= this.INITIALIZE_TIMER_STANDARD_MINUTE) this.alarmTimer.initializeMinute();
      this.stopTimer.increaseMinute();
    }
  }
}

export default Background;
