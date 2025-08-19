import { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true, 
  },
  status: {
    type: String,
    enum: ['Pending', 'Done'],
    default: 'Pending',
  },
  isImportant: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: 'General',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = models.Task || model('Task', TaskSchema);

export default Task;
