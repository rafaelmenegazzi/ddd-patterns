import Order from "../../../../domain/checkout/entity/order";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const order = await OrderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        where: {
          id: entity.id,
        },
      },
    )

    if (order?.[0]) {
      const itemsPromises = entity.items.map(item =>
        OrderItemModel.upsert({
          id: item.id,
          name: item.name,
          order_id: entity.id,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })
      )
      await Promise.all(itemsPromises)
    }
  }

  async find(id: string): Promise<Order> {
    throw new Error ('not implemented')
  }

  async findAll(): Promise<Order[]> {
    throw new Error ('not implemented')
  }
}
