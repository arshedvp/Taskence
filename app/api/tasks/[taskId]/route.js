import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Task from '@/models/Task';

export async function DELETE(req, context) {
  const { params } = context;
  const { taskId } = await params;

  try {
    await connectToDatabase();

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



// PATCH: Update a task
export async function PATCH(request, context) {
  await connectToDatabase();
  const { params } = context;
  const { taskId } = await params;
  const data = await request.json();

delete data.creator;

  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, data, { new: true });
    if (!updatedTask) {
      return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(updatedTask), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error updating task' }), { status: 500 });
  }
}
