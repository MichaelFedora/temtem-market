export interface SerializedUser {
  id?: string;

  discordAvatar: string;
  discordName: string;

  temUserID: string;
  temUserName: string;

  status: 'online' | 'in_game' | 'invisible';
  heartbeat: number;
}

export const userStatusType = ['online', 'in_game', 'invisible'];

export class User {
  id: string;

  discordAvatar: string;
  /** name#hash */
  discordName: string;

  temUserID: string;
  temUserName: string;

  status: 'online' | 'in_game' | 'invisible';
  heartbeat: number;

  constructor(user: Partial<User> = { }) {
    this.id = String(user.id || '');

    this.discordAvatar = String(user.discordAvatar || '');
    this.discordName = String(user.discordName);

    this.temUserID = String(user.temUserID || '');
    this.temUserName = String(user.temUserName || '');

    this.status = userStatusType.includes(user.status || '') ? user.status : 'online';
    this.heartbeat = Number(user.heartbeat) || 0;
  }

  public serialize(noId = false): SerializedUser {
    const u: SerializedUser = {
      discordAvatar: this.discordAvatar,
      discordName: this.discordName,
      temUserID: this.temUserID,
      temUserName: this.temUserName,
      status: this.status,
      heartbeat: this.heartbeat
    };
    if(!noId)
      u.id = this.id;
    return u;
  }

  public static deserialize(obj: SerializedUser): User {
    return new User({
      id: obj.id,
      discordAvatar: obj.discordAvatar,
      discordName: obj.discordName,

      temUserID: obj.temUserID,
      temUserName: obj.temUserName,

      status: obj.status,
      heartbeat: obj.heartbeat
    });
  }
}
