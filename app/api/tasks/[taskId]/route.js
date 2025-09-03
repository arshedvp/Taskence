import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import connectToDatabase from '@/utils/db';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';
import { readUserTasksFromDrive, writeUserTasksToDrive } from '@/utils/googleDrive';

export async function DELETE(req, context) {
  const { params } = context;
  const { taskId } = await params; // Await per Next.js guidance

  try {
    // Determine provider
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.provider === 'google') {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      const accessToken = token?.googleAccessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Missing Google access token' }, { status: 401 });
      }
      const { tasks } = await readUserTasksFromDrive(accessToken, 'taskence.json');
      const idx = tasks.findIndex(t => t._id === taskId);
      if (idx === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      const updated = tasks.filter(t => t._id !== taskId);
      await writeUserTasksToDrive(accessToken, updated, 'taskence.json');
      return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    }

    // Credentials user → MongoDB path
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
  const { params } = context;
  const { taskId } = await params; // Await per Next.js guidance

  // Parse body
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  // Determine provider
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Google user → update in Drive appData
  if (session.user?.provider === 'google') {
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const accessToken = token?.googleAccessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Missing Google access token' }, { status: 401 });
      }
      const { tasks } = await readUserTasksFromDrive(accessToken, 'taskence.json');
      const idx = tasks.findIndex(t => t._id === taskId);
      if (idx === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

      const allowed = ['title', 'description', 'status', 'isImportant', 'category'];
      const updated = { ...tasks[idx] };
      for (const k of allowed) {
        if (k in data) updated[k] = typeof data[k] === 'string' ? data[k].trim?.() ?? data[k] : data[k];
      }
      // Keep original createdAt
      tasks[idx] = updated;
      await writeUserTasksToDrive(accessToken, tasks, 'taskence.json');
      return NextResponse.json(updated, { status: 200 });
    } catch (error) {
      console.error('Google task update error:', error);
      return NextResponse.json({ message: 'Failed to update Google task', error: error?.message || String(error) }, { status: 500 });
    }
  }

  // Credentials user → MongoDB update
  await connectToDatabase();
  // Sanitize immutable/unwanted fields
  if (data) {
    delete data._id;
    delete data.createdAt;
    delete data.creator;
    delete data.__v;
  }
  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, data, { new: true, runValidators: true });
    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ message: 'Error updating task', error: error?.message || String(error) }, { status: 500 });
  }
}
