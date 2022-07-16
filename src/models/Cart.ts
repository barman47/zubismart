import { Document, Schema, model, Types } from 'mongoose';

export interface Cart extends Document {
    _id?: string;
    products: string[];
    user: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date; 
}

const CartSchema = new Schema<Cart>({
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Cart product is required!']
        }
    ],

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cart user is required!']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    },
});

CartSchema.index({'$**': 'text'});
export default model<Cart>('Cart', CartSchema);