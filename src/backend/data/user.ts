export interface SerializedUser {
  id?: string;

  discordAvatar: string;
  discordName: string;

  temUserID: string;
  temUserName: string;
}

export class User {
  id: string;

  discordAvatar: string;
  /** name#hash */
  discordName: string;

  temUserID: string;
  temUserName: string;

  constructor(user: Partial<User> = { }) {
    this.id = String(user.id || '');

    this.discordAvatar = String(user.discordAvatar || '');
    this.discordName = String(user.discordName);

    this.temUserID = String(user.temUserID || '');
    this.temUserName = String(user.temUserName || '');
  }

  public serialize(noId = false): SerializedUser {
    const u: SerializedUser = {
      discordAvatar: this.discordAvatar,
      discordName: this.discordName,
      temUserID: this.temUserID,
      temUserName: this.temUserName
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
      temUserName: obj.temUserName
    });
  }
}
