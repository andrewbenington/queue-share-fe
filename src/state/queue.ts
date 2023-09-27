import { createContext } from 'react';

export interface QueueState {
  currently_playing?: Track;
  queue?: Track[];
  error?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  image: {
    height: number;
    width: number;
    url: string;
  };
}

const QueueContext = createContext<QueueState | null>(null);

export default QueueContext;
