import { QueueState } from '../state/queue';

export async function GetQueue(roomCode: string): Promise<QueueState> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/${roomCode}/queue`,
    {
      headers: {
        Authorization:
          'Basic ' + btoa(`username:${localStorage.getItem('room_pass')}`),
      },
    }
  );
  const body = await res.json();
  if (!res.ok && !body?.error) {
    return { error: `${res.status} response` };
  }
  return body;
}

export async function AddToQueue(
  roomCode: string,
  songID: string
): Promise<QueueState> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/${roomCode}/queue/${songID}`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' + btoa(`username:${localStorage.getItem('room_pass')}`),
      },
    }
  );
  return res.json();
}
