import { createContext } from 'react';

export interface RoomState {
  name: string;
  host: string;
  code: string;
}

const RoomContext = createContext<RoomState | null>(null);

export default RoomContext;
