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
