// Minimal Google Drive App Data helper using REST API and fetch

const DRIVE_LIST = 'https://www.googleapis.com/drive/v3/files';

async function listAppDataFiles(accessToken, name) {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${name}' and 'appDataFolder' in parents`,
    fields: 'files(id,name)'
  });
  const res = await fetch(`${DRIVE_LIST}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to list appData files');
  const data = await res.json();
  return data.files || [];
}

async function downloadFile(accessToken, fileId) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to download file');
  return await res.text();
}

async function createJsonInAppData(accessToken, name, jsonString) {
  const metadata = { name, parents: ['appDataFolder'], mimeType: 'application/json' };
  const boundary = `taskence_${Date.now()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    jsonString,
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error('Failed to create appData file');
  return await res.json();
}

async function updateJsonFile(accessToken, fileId, jsonString) {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonString,
  });
  if (!res.ok) throw new Error('Failed to update appData file');
  return await res.json();
}

export async function readUserTasksFromDrive(accessToken, filename = 'taskence.json') {
  const files = await listAppDataFiles(accessToken, filename);
  if (!files.length) return { fileId: null, tasks: [] };
  const fileId = files[0].id;
  const content = await downloadFile(accessToken, fileId);
  if (!content) return { fileId, tasks: [] };
  try {
    const parsed = JSON.parse(content);
    return { fileId, tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [] };
  } catch {
    return { fileId, tasks: [] };
  }
}

export async function writeUserTasksToDrive(accessToken, tasks, filename = 'taskence.json') {
  const files = await listAppDataFiles(accessToken, filename);
  const jsonString = JSON.stringify({ tasks });
  if (!files.length) {
    const created = await createJsonInAppData(accessToken, filename, jsonString);
    return created?.id || null;
  }
  const fileId = files[0].id;
  await updateJsonFile(accessToken, fileId, jsonString);
  return fileId;
}

export default {
  readUserTasksFromDrive,
  writeUserTasksToDrive,
};
