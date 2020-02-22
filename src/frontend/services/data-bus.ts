import { Temtem, User } from '../data/data';

const nullUser: User = Object.freeze({
  id: '',
  discordName: '',
  discordAvatar: '',
  temUserName: '',
  temUserID: '',
  status: 'online',
  heartbeat: 0
} as User);

export default new class DataBus {
  state: {
    temDB: Temtem[];
    user: User;
  } = {
    temDB: [],
    user: nullUser
  };

  setUser(u: User) {
    if(!u)
      this.state.user = nullUser;
    else
      this.state.user = Object.assign({ }, nullUser, u);
  }
}();
