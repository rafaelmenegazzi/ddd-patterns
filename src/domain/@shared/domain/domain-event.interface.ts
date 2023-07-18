export interface IDomainEvent {
    dataTimeOccurred: Date;
    eventData: unknown;
}