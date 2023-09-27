import { Track } from '../state/queue';

export async function SearchTracks(
  roomCode: string,
  term: string
): Promise<Track[] | undefined> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/${roomCode}/search?q=` +
        encodeURIComponent(term),
      {
        headers: {
          Authorization:
            'Basic ' + btoa(`username:${localStorage.getItem('room_pass')}`),
        },
      }
    ).catch((e) => console.log(e));
    return res?.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
