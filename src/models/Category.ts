import { Document, Schema, model } from 'mongoose';

export interface Category extends Document {
    _id?: string;
    title: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategorySchema = new Schema<Category>({
    title: {
        type: String,
        required: [true, 'Title of category is requires!'],
        uppercase: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        uppercase: true,
        trim: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// CategorySchema.index({'$**': 'text'});
export default model<Category>('Category', CategorySchema);