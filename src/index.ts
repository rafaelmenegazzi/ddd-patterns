import EventEmitter from 'eventemitter2'

import { Mediator } from "./domain/@shared/service/mediator";
import { CustomerAddressChangedEvent, CustomerCreatedEvent } from "./domain/customer/events";
import { EnviaConsoleLog1Handler, EnviaConsoleLog2Handler, EnviaConsoleLog3Handler } from "./domain/customer/events/handlers";

const eventEmitter = new EventEmitter();
const mediator = new Mediator(eventEmitter);

const enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
const enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();
const enviaConsoleLog3Handler = new EnviaConsoleLog3Handler();

mediator.register(CustomerCreatedEvent.name, (event: CustomerCreatedEvent) => {
    enviaConsoleLog1Handler.handle(event)
    enviaConsoleLog2Handler.handle(event)
})

mediator.register(CustomerAddressChangedEvent.name, (event: CustomerAddressChangedEvent) => {
    enviaConsoleLog3Handler.handle(event)
})
