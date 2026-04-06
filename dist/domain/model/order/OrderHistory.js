export class OrderHistory {
    id;
    orderId;
    fromStatus;
    toStatus;
    createdAt;
    constructor(id, orderId, fromStatus, toStatus, createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.createdAt = createdAt;
    }
    static create(id, orderId, fromStatus, toStatus) {
        return new OrderHistory(id, orderId, fromStatus, toStatus, new Date());
    }
    static reconstitute(id, orderId, fromStatus, toStatus, createdAt) {
        return new OrderHistory(id, orderId, fromStatus, toStatus, createdAt);
    }
}
