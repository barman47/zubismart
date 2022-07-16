import { Document, Schema, model, Types } from 'mongoose';

import { Condition, ProductCondition } from '../utils/constants';

export interface Product extends Document {
    _id?: string;
    title: string;
    description: string;
    brand?: string;
    condition: ProductCondition;
    price: number;
    deliveryPrice?: number;
    quantity: number;
    returnable: boolean;
    location: string;
    images: string[];
    user: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date; 
}

const ProductSchema = new Schema<Product>({
    title: {
        type: String,
        required: [true, 'Product title is required!'],
        uppercase: true,
        trim: true
    },

    description: {
        type: String,
        uppercase: true,
        required: [true, 'Product description is required!'],
        trim: true
    },

    brand: {
        type: String,
        uppercase: true,
        trim: true
    },

    condition: {
        type: String,
        required: [true, 'Product condition is required!'],
        enum: [Condition.NEW, Condition.THRIFTED],
        trim: true
    },

    price: {
        type: Number,
        required: [true, 'Product price is required!'],
        trim: true
    },

    deliveryPrice: {
        type: Number,
        required: [true, 'Product delivery price is required!'],
        trim: true
    },

    quantity: {
        type: Number,
        required: [true, 'Product quantity is required!'],
        trim: true
    },

    returnable: {
        type: Boolean,
        required: [true, 'Product returnable is required!'],
    },

    location: {
        type: String,
        required: [true, 'Product location is required!'],
        uppercase: true,
        trim: true
    },

    images: [
        {
            url: {
                type: String,
                required: [true, 'Product image url is required!'],
                trim: true
            },

            imageKey: {
                type: String,
                required: [true, 'Product image key is required!'],
                trim: true
            }
        }
    ],

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Product user is required!']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    },
});

ProductSchema.index({'$**': 'text'});
export default model<Product>('Product', ProductSchema);