import EventEmitter from 'eventemitter2'
import { Sequelize } from "sequelize-typescript";
import { v4 as uuid } from "uuid";

import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from '../../../infrastructure/customer/repository/sequelize/customer.repository';
import { Mediator } from "../../@shared/service/mediator";
import Customer from "../entity/customer";
import { CustomerAddressChangedEvent, CustomerCreatedEvent } from "../events";
import { EnviaConsoleLog1Handler, EnviaConsoleLog2Handler, EnviaConsoleLog3Handler } from "../events/handlers";
import CustomerRepositoryInterface from '../repository/customer-repository.interface';
import Address from '../value-object/address';
import CustomerService from "./customer.service";

describe("Customer service unit tests", () => {
  let sequelize: Sequelize;
  let customerRepository: CustomerRepositoryInterface
  let mediator: Mediator
  let enviaConsoleLog1Handler: EnviaConsoleLog1Handler
  let enviaConsoleLog2Handler: EnviaConsoleLog2Handler
  let enviaConsoleLog3Handler: EnviaConsoleLog3Handler
  let spyEventHandler1: jest.SpyInstance
  let spyEventHandler2: jest.SpyInstance
  let spyEventHandler3: jest.SpyInstance

  beforeEach(async () => {
    // Repository init
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();
    customerRepository = new CustomerRepository();
    
    // Mediator init
    const eventEmitter = new EventEmitter();
    mediator = new Mediator(eventEmitter);
    enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
    enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();
    enviaConsoleLog3Handler = new EnviaConsoleLog3Handler();

    mediator.register(CustomerCreatedEvent.name, (event: CustomerCreatedEvent) => {
        enviaConsoleLog1Handler.handle(event)
        enviaConsoleLog2Handler.handle(event)
    })
    mediator.register(CustomerAddressChangedEvent.name, (event: CustomerAddressChangedEvent) => {
        enviaConsoleLog3Handler.handle(event)
    })

    spyEventHandler1 = jest.spyOn(enviaConsoleLog1Handler, "handle");
    spyEventHandler2 = jest.spyOn(enviaConsoleLog2Handler, "handle");
    spyEventHandler3 = jest.spyOn(enviaConsoleLog3Handler, "handle");
  });

  afterEach(async () => {
    await sequelize.close();
  });
  
  it("should create customer and publish events", async () => {
    const customerService = new CustomerService(customerRepository, mediator)

    const name = 'customer name 1'
    const customer = await customerService.create(name)
    const customerDoc = await customerRepository.find(customer.id)

    expect(customer).toBeInstanceOf(Customer)
    expect(customer).toEqual(customerDoc)
    expect(customer.name).toEqual(name)  
    expect(spyEventHandler1).toHaveBeenCalled()
    expect(spyEventHandler2).toHaveBeenCalled()
    expect(spyEventHandler3).not.toHaveBeenCalled()
  });

  it("should update customer address and publish events", async () => {
    const customerService = new CustomerService(customerRepository, mediator)
    
    const id = uuid()
    const name = 'customer name 1'
    const customer = new Customer(id, name)
    await customerRepository.create(customer)

    const newAddress = new Address('street 2', 2, '123456780', 'city 2')
    await customerService.changeAddress(id, newAddress.street, newAddress.number, newAddress.zip, newAddress.city)
    const customerDoc = await customerRepository.find(id)

    expect(customerDoc.Address).toEqual(newAddress)
    expect(spyEventHandler1).not.toHaveBeenCalled()
    expect(spyEventHandler2).not.toHaveBeenCalled()
    expect(spyEventHandler3).toHaveBeenCalled()
  });
});
