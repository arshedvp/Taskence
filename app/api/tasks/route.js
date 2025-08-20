import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db'; // your db connector
import Task from '@/models/Task'; // your Task model
import User from '@/models/User'; 
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { readUserTasksFromDrive, writeUserTasksToDrive } from '@/utils/googleDrive';
import { getToken } from 'next-auth/jwt';

// Create a new task
export async function POST(request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { title, description, status, isImportant, category } = await request.json();

    // Validation (optional but recommended)
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // If signed in with Google, write to user's Google Drive appData
    if (session.user?.provider === 'google') {
      try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        const accessToken = token?.googleAccessToken;
        if (!accessToken) {
          console.error('Google access token missing for user:', session.user);
          return NextResponse.json({ error: 'Missing Google access token' }, { status: 401 });
        }
        const { tasks } = await readUserTasksFromDrive(accessToken, 'taskence.json');
        const newTask = {
          _id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
          title: title.trim(),
          description: description?.trim?.() || '',
          status: status || 'Pending',
          isImportant: !!isImportant,
          category: category || 'General',
          createdAt: new Date().toISOString(),
        };
        const updated = [newTask, ...tasks];
        try {
          await writeUserTasksToDrive(accessToken, updated, 'taskence.json');
        } catch (driveErr) {
          console.error('Error writing tasks to Google Drive:', driveErr);
          return NextResponse.json({ error: 'Failed to write tasks to Google Drive', details: driveErr?.message || driveErr }, { status: 500 });
        }
        return NextResponse.json({ message: 'Task created', task: newTask }, { status: 201 });
      } catch (err) {
        console.error('Google user task creation error:', err);
        return NextResponse.json({ error: 'Google user task creation failed', details: err?.message || err }, { status: 500 });
      }
    }

    // Find the creator's User ID (support credentials and OAuth MongoDB path)
    let user = null;
    if (session.user?.id) {
      user = await User.findById(session.user.id);
    }
    if (!user && session.user?.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() });
    }
    if (!user && session.user?.name) {
      user = await User.findOne({ username: session.user.name });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const task = await Task.create({
      creator: user._id,
      title: title.trim(),
  description: description?.trim?.() || '',
      status: status || 'Pending',
      isImportant: !!isImportant,
      category: category || 'General',
    });

    return NextResponse.json({ message: 'Task created', task }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// export async function GET(request) {
//   try {
//     await connectToDatabase();
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const statusFilter = searchParams.get('status'); // e.g. "Pending" or "Done"

//     const query = {};
//     // Add status filter only if it exists and is valid
//     if (statusFilter && ['Pending', 'Done'].includes(statusFilter)) {
//       query.status = statusFilter;
//     }

//     // Optional: fetch all tasks regardless of creator or restrict by creator
//     // Here, fetching all tasks as per your previous request

//     const total = await Task.countDocuments(query);
    // const tasks = await Task.find(query)
    //   .populate('creator', 'username')
    //   .sort({ createdAt: -1 })

//     const serializedTasks = tasks.map(task => ({
//       ...task.toObject(),
//       creator: task.creator?.username || "Unknown Creator",
//     }));

//     return NextResponse.json({
//       tasks: serializedTasks
//     });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
//   }
// }



export async function GET(request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If Google user, read from Drive appData
    if (session.user?.provider === 'google') {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const accessToken = token?.googleAccessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Missing Google access token' }, { status: 401 });
      }
      const { searchParams } = new URL(request.url);
      const statusFilter = searchParams.get('status');
      const searchTerm = searchParams.get('search');

      const { tasks } = await readUserTasksFromDrive(accessToken, 'taskence.json');
      // Apply simple filtering in-memory
      let filtered = tasks;
      if (statusFilter && ['Pending', 'Done'].includes(statusFilter)) {
        filtered = filtered.filter(t => t.status === statusFilter);
      }
      if (searchTerm) {
        const re = new RegExp(searchTerm, 'i');
        filtered = filtered.filter(t => re.test(t.title) || re.test(t.description) || re.test(t.category || ''));
      }
      // Sort by createdAt desc if present
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return NextResponse.json({ tasks: filtered });
    }

    const user = await User.findOne({ username: session.user.name }) || (session.user?.id ? await User.findById(session.user.id) : null) || (session.user?.email ? await User.findOne({ email: session.user.email.toLowerCase() }) : null);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const searchTerm = searchParams.get('search'); // Get the search term from the query

    const query = { creator: user._id };

    if (statusFilter && ['Pending', 'Done'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const tasksFromDB = await Task.find(query)
      .populate('creator', 'username name email')
      .sort({ createdAt: -1 });

    const tasks = tasksFromDB.map(task => {
      const taskObject = task.toObject();
      taskObject.creator = task.creator ? {
        _id: task.creator._id,
        username: task.creator.username
      } : null;
      return taskObject;
    });
    return NextResponse.json({ tasks });
    
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
