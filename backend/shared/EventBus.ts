type EventCallback = (data: any) => void | Promise<void>;

export class NativeEventBus {
  private listeners: Record<string, EventCallback[]> = {};

  subscribe(eventName: string, callback: EventCallback): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  async publish(eventName: string, data: any): Promise<void> {
    const eventListeners = this.listeners[eventName];
    if (!eventListeners) return;

    const promises = eventListeners.map(async (callback) => {
      try {
        await callback(data);
      } catch (error) {
        console.error(
          `[EventBus] Помилка в обробнику для ${eventName}:`,
          error,
        );
      }
    });

    await Promise.all(promises);
  }
}

export const globalEventBus = new NativeEventBus();
