import { CustomerAddressChangedEvent, CustomerCreatedEvent } from "../events";
import Address from "../value-object/address";
import Customer from "./customer";

describe("Customer unit tests", () => {
  it("should throw error when id is empty", () => {
    expect(() => {
      let customer = new Customer("", "John");
    }).toThrowError("Id is required");
  });

  it("should throw error when name is empty", () => {
    expect(() => {
      let customer = new Customer("123", "");
    }).toThrowError("Name is required");
  });

  it("should change name", () => {
    // Arrange
    const customer = new Customer("123", "John");

    // Act
    customer.changeName("Jane");

    // Assert
    expect(customer.name).toBe("Jane");
  });

  it("should activate customer", () => {
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.Address = address;

    customer.activate();

    expect(customer.isActive()).toBe(true);
  });

  it("should throw error when address is undefined when you activate a customer", () => {
    expect(() => {
      const customer = new Customer("1", "Customer 1");
      customer.activate();
    }).toThrowError("Address is mandatory to activate a customer");
  });

  it("should deactivate customer", () => {
    const customer = new Customer("1", "Customer 1");

    customer.deactivate();

    expect(customer.isActive()).toBe(false);
  });

  it("should add reward points", () => {
    const customer = new Customer("1", "Customer 1");
    expect(customer.rewardPoints).toBe(0);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(10);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(20);
  });

  it("should add event after create customer", () => {
    const customer = Customer.create("1", "Customer 1");
    
    expect(customer.events.size).toBe(1)
    
    const [first] = customer.events
    expect(first).toBeInstanceOf(CustomerCreatedEvent)
    expect(first).toEqual({
      dataTimeOccurred: expect.any(Date),
      eventData: customer
    })
  });

  it("should add event after customer address changed", () => {
    const customer = Customer.create("1", "Customer 1");
    customer.changeAddress(new Address("street 2", 2, "123456789", "city 2"))
    
    expect(customer.events.size).toBe(2)
    
    const [, second] = customer.events
    expect(second).toBeInstanceOf(CustomerAddressChangedEvent)
    expect(second).toEqual({
      dataTimeOccurred: expect.any(Date),
      eventData: customer
    })
  });
});
