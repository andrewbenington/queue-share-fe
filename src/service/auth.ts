export type RoomCredentials =
  | {
      token: string;
      roomPassword?: string;
    }
  | {
      guestID: string;
      roomPassword: string;
    };
