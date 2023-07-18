import { v4 as uuid } from 'uuid'

import { Mediator } from "../../@shared/service/mediator";
import Customer from "../entity/customer";
import CustomerRepositoryInterface from '../repository/customer-repository.interface';
import Address from '../value-object/address';

export default class CustomerService{
    constructor(
        private customerRepository: CustomerRepositoryInterface, 
        private mediator: Mediator,
        ){}

    async create(name: string){
        const customer = Customer.create(uuid(), name);
        await this.customerRepository.create(customer);
        await this.mediator.publish(customer); 
        return customer;
    }

    async changeAddress(id: string, street: string, number: number, zip: string, city: string){
        const customer = await this.customerRepository.find(id)
        const newAddress = new Address(street, number, zip, city)
        customer.changeAddress(newAddress)
        await this.customerRepository.update(customer);
        await this.mediator.publish(customer); 
        return;
    }
}
