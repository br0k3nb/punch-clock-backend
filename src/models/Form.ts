import mongoose from 'mongoose';
import FormSchema from '../schemas/FormSchema';

import mongoosePaginate from 'mongoose-paginate-v2';

FormSchema.pre('findOneAndUpdate', function (next) {
    this.findOneAndUpdate({}, { updatedAt: new Date() });
    
    next();
});

FormSchema.pre('save', function (next) {
    if (!this.isNew) this.updatedAt = new Date();

    next();
});

FormSchema.plugin(mongoosePaginate);

const Form = mongoose.model('Form', FormSchema, 'forms');

Form.createIndexes();

export default Form;