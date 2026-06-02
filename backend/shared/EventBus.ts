export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
  payload: any;
}

export class EventBusRoot {
  private domainEvents: any[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}

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

  async publishFromAggregate(entity: EventBusRoot): Promise<void> {
    const events = entity.pullDomainEvents();

    for (const event of events) {
      await this.publish(event.eventName, event.payload);
    }
  }
}

export const globalEventBus = new NativeEventBus();
