import { Document, Schema, model, Types } from 'mongoose';

import { OrderStatus, OrderStatusType } from '../utils/constants';

export interface Order extends Document {
    _id?: string;
    status: OrderStatusType;
    amount: number;
    products: string[];
    user: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderSchema = new Schema<Order>({
    status: {
        type: String,
        required: [true, 'Order status is required!'],
        enum: [OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.CANCELED],
        uppercase: true,
        trim: true
    },

    amount: {
        type: Number,
        required: [true, 'Order amount is required!'],
        trim: true
    },

    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order products is required!']
        }
    ],

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order user is required!']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    },
});

OrderSchema.index({'$**': 'text'});
export default model<Order>('Order', OrderSchema);