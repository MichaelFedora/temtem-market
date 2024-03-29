import { r, MasterPool, RTable, RDatabase, JoinResult, RStream } from 'rethinkdb-ts';
import { User, SerializedUser, userStatusType } from '../data/user';
import { NotFoundError, NotAllowedError } from '../data/errors';
import { getLogger, Logger } from 'log4js';
import { Session } from '../data/session';
import { Config } from '../data/config';
import { SerializedListing, PartialListing, Listing } from '../data/listing';
import { Temtem, Stats } from '../data/temtem';
import { readJSONSync } from 'fs-extra';
import * as path from 'path';
import { calcScore, stat_50, stat_0 } from '../util';

interface IDBService {
  db: RDatabase;
  sessionExpTime: number;
  heartbeatTimeout: number;
  usersTbl: RTable<SerializedUser>;
  sessionsTbl: RTable<Session>;
  temdataTbl: RTable<Temtem>;
  listingsTbl: RTable<SerializedListing>;
}

class DatabaseService implements IDBService {

  private pool: MasterPool;
  private logger = getLogger('services.db');

  public get tableNames() { return [ 'users', 'sessions', 'temdata', 'listings' ]; }

  private config: Config;

  public get dbName() { return this.config.db; }
  public get sessionExpTime() { return this.config.sessionExpTime; }
  public get heartbeatTimeout() { return this.config.heartbeatTimeout; }

  public get db() { return r.db(this.dbName); }

  public get usersTbl(): RTable<SerializedUser> { return this.db.table('users'); }
  public get sessionsTbl(): RTable<Session> { return this.db.table('sessions'); }
  public get temdataTbl(): RTable<Temtem> { return this.db.table('temdata'); }
  public get listingsTbl(): RTable<SerializedListing> { return this.db.table('listings'); }

  public async init(config: Config): Promise<void> {
    this.config = config;
    this.pool = await r.connectPool({ host: config.db_host, port: config.db_port });

    await r.dbList().contains(this.dbName).run().then(async result => {
      if(!result)
        await r.dbCreate(this.dbName).run().then(a => this.logger.info(`Created db "${this.dbName}!`));
    });

    await r(this.tableNames).difference(this.db.tableList()).run().then(async result => {
      for(const tableName of result)
        await this.db.tableCreate(tableName).run().then(a => this.logger.info(`Created table "${tableName}"!`));
    });

    await this.users.init();
    await this.sessions.init();
    await this.temdata.init();
    await this.listings.init();
  }

  private _users = new class Users {
    constructor(private parent: IDBService, private logger: Logger) { }

    public get table() { return this.parent.usersTbl; }

    public async init() {
      await this.table.indexList().run().then(async result => {
        if(!result.includes('temUserID'))
          await this.table.indexCreate('temUserID').run()
            .then(() => this.table.indexWait('temUserID').run())
            .then(a => this.logger.info('Created temUserID index in user table.'));
      });
    }

    public async register(id: string, avatar: string, name: string, temUserName: string, temUserID: string) {
      const user = await this.table.get(id).run();

      if(user)
        throw new Error('More than one user with id ' + id + '!');

      const temUsers = await this.table.getAll(temUserID, { index: 'temUserID' }).run();

      // if(temUsers.length)
      //   throw new Error('More than one user with temUserID ' + id + '!');

      await this.table.insert(new User({
        id, discordAvatar: avatar, discordName: name, temUserName, temUserID
      }).serialize(), { conflict: 'replace' }).run();

      return this.get(id);
    }

    public async delete(id: string) {
      const user = await this.table.get(id).run();
      if(user) {
        return Promise.all([
          this.table.get(user.id).delete().run(),
          this.parent.sessionsTbl.getAll(user.id, { index: 'userID' }).delete().run(),
          this.parent.listingsTbl.getAll(user.id, { index: 'userID' }).delete().run()
        ]);
      } else
        throw new NotFoundError('No user found with id ' + id + '!');
    }

    public async get(id: string) {
      const user = await this.table.get(id).run();
      return user ? User.deserialize(user) : null;
    }

    public async getFromTemUserID(temUserID: string) {
      const users = await this.table.getAll(temUserID, { index: 'temUserID' }).run();
      if(users.length > 1) throw new Error('More than one user with bucket temUserID ' + temUserID + '!');
      if(users.length <= 0) throw new NotFoundError('No users with the bucket temUserID ' + temUserID + '!');
      return User.deserialize(users[0]);
    }

    public async getAll() {
      const users = await this.table.run();
      return users.map(a => User.deserialize(a));
    }

    public async update(user: User) {
      return this.table.get(user.id).update(user.serialize(true)).run();
    }

    public async updateTemInfo(id: string, temUserName: string, temUserID: string) {
      return this.table.get(id).update({ temUserName, temUserID }).run();
    }

  }(this, this.logger);
  public get users() { return this._users; }



  private _sessions = new class Sessions {
    constructor(private parent: IDBService, private logger: Logger) { }

    public get table(): RTable<Session> { return this.parent.sessionsTbl; }

    public async init() {
      await this.table.indexList().run().then(async result => {
        if(!result.includes('userID'))
          await this.table.indexCreate('userID').run()
            .then(() => this.table.indexWait('userID').run())
            .then(a => this.logger.info('Created userID index in session table.'));
      });
    }

    public async create(userID: string) {
      await this.trimUser(userID); // trim them whenever we create another one
      const res = await this.table.insert({ userID, created: Date.now() } as Session).run();
      return res.generated_keys[0];
    }

    public async get(id: string) {
      return this.table.get(id).run();
    }

    public async getAllForUser(userID: string) {
      return this.table.getAll(userID, { index: 'userID' }).run();
    }

    public async refresh(id: string) {
      await this.table.get(id).update({ created: Date.now() } as Partial<Session>).run();
    }

    public async delete(id: string) {
      await this.table.get(id).delete().run();
    }

    public async trim() {
      return this.table.filter(doc => doc('created').lt(Date.now() - this.parent.sessionExpTime)).delete().run();
    }

    public async trimUser(userID: string) {
      return this.table.getAll(userID, { index: 'userID' })
        .filter(doc => doc('created').lt(Date.now() - this.parent.sessionExpTime))
        .delete().run();
    }
  }(this, this.logger);
  public get sessions() { return this._sessions; }


  private _temdata = new class TemData {
    constructor(private parent: IDBService, private logger: Logger) { }

    public get table(): RTable<Temtem> { return this.parent.temdataTbl; }

    public async init() {

      const data: {
        id: string;
        name: string;
        type: string[];
        stats: Stats;
        traits: string[];
        bred_techniques: string[];
        evolution: number[];
        score?: number;
      }[] = readJSONSync(path.join(process.cwd(), 'temdata.json'));

      for(const entry of data) {
        entry.score = calcScore(entry.stats, stat_50, stat_0);
        await this.table.insert(data, { conflict: 'replace' }).run();
      }

      this.logger.info('Added temdata: ' + data.length + ' entries.');
    }

    public async getAll() {
      return this.table.orderBy('id').run();
    }

    public async search(text: string, limit = 20, start = 0) {
      if(limit)
        limit = Math.max(1, Math.min(50, Number(limit)));
      if(start)
        start = Math.max(0, Number(start));
      const groups = text.split(/\W/).filter(a => a);
      return this.table
        .filter(doc => doc('name').match(`(?i)${groups.map(a => `(?:${a})`)})`).ne(null))
        .skip(start).limit(limit).run();
    }

  }(this, this.logger);
  public get temdata() { return this._temdata; }


  private _listings = new class Listings {
    constructor(private parent: IDBService, private logger: Logger) { }

    public get table(): RTable<SerializedListing> { return this.parent.listingsTbl; }

    public async init() {
      await this.table.indexList().run().then(async result => {
        if(!result.includes('userID'))
          await this.table.indexCreate('userID').run()
            .then(() => this.table.indexWait('userID').run())
            .then(a => this.logger.info('Created userID index in listings table.'));
        if(!result.includes('type'))
          await this.table.indexCreate('type', { multi: true }).run()
            .then(() => this.table.indexWait('type').run())
            .then(a => this.logger.info('Created type index in listings table.'));
        if(!result.includes('temID'))
          await this.table.indexCreate('temID').run()
            .then(() => this.table.indexWait('temID').run())
            .then(a => this.logger.info('Created temID index in listings table.'));
        if(!result.includes('luma'))
          await this.table.indexCreate('luma').run()
            .then(() => this.table.indexWait('luma').run())
            .then(a => this.logger.info('Created luma index in listings table.'));
      });
    }

    private async makeListing(userID: string, listing: PartialListing) {

      const user = await this.parent.usersTbl.get(userID).run();
      if(!user)
        throw new Error('User ' + userID + ' does not exist!');

      const tem = await this.parent.temdataTbl.get(listing.temID).run();
      // validate things

      for(const k of ['hp', 'sta', 'spd', 'atk', 'def', 'spatk', 'spdef']) {
        listing.svs[k] = listing.svs[k] ? Math.round(Math.max(0, Math.min(50, listing.svs[k]))) : 0;
        listing.tvs[k] = listing.tvs[k] ? Math.round(Math.max(0, Math.min(500, listing.tvs[k]))) : 0;
      }

      if(!tem.traits.includes(listing.trait))
        listing.trait = 'Unknown';

      const highSVs = Object.values(listing.svs).filter(a => a >= 49).length;
      const maxFertility = 8 - Math.ceil(highSVs / 2);
      listing.fertility = Math.min(listing.fertility || 0, maxFertility);

      listing.bred_techniques = listing.bred_techniques.filter(a => tem.bred_techniques.includes(a));

      listing.price = Math.floor(Math.max(0, listing.price));

      // generate score

      let score = calcScore(tem.stats, listing.svs, listing.tvs);

      let score_evo = 0;
      const evo_id = tem.evolution.length ? tem.evolution[tem.evolution.length - 1] : null;
      if(evo_id && evo_id !== tem.id) {
        const tem_evo = await this.parent.temdataTbl.get(evo_id).run();

        score_evo = calcScore(tem_evo.stats, listing.svs, listing.tvs);
      }

      // generate badges

      const badges: string[] = [];

      if(!Object.values(listing.svs).find(a => a < 50)) {
        badges.push('perfect');
        score += 5;
        if(score_evo > 0)
          score_evo += 5;
      }

      if(!Object.values(listing.tvs).find(a => a > 0)) {
        badges.push('untrained');
        score += 20;
        if(score_evo > 0)
          score_evo += 20;
      } else {
        const topTwo = Object.entries(tem.stats).sort(([k, v], [k2, v2]) => v2 - v).slice(0, 2).map(([k, v]) => k);
        if(!(listing.tvs[topTwo[0]] < 500 || listing.tvs[topTwo[1]] < 500)) {
          badges.push('specialized');
          score += 5;
          if(score_evo > 0)
            score_evo += 5;
        } else if(Object.values(listing.tvs).reduce((acc, c) => acc + c) >= 1000) {
          badges.push('trained');
          score += 2;
          if(score_evo > 0)
            score_evo += 2;
        }
      }

      return new Listing(Object.assign({ }, listing, {
        userID,
        temName: tem.name,
        temType: tem.type,
        bred_techniques: listing.bred_techniques,
        trait: listing.trait,
        score,
        score_evo,
        badges,
        timestamp: Date.now()
      } as Partial<Listing>));
    }

    public async add(userID: string, listing: PartialListing) {
      const count = await this.table.getAll(userID, { index: 'userID' }).count().run();

      if(count >= 100)
        throw new NotAllowedError('Cannot have more than 100 listings!');

      const actual = await this.makeListing(userID, listing);
      const result = await this.table.insert(actual.serialize(true)).run();
      actual.id = result.generated_keys[0];
      return actual;
    }

    public async update(id: string, userID: string, listing: PartialListing) {
      const actual = await this.makeListing(userID, listing);
      await this.table.get(id).update(actual.serialize(true)).run();
    }

    public async delete(listingID: string) {
      await this.table.get(listingID).delete().run();
    }

    public async get(listingID: string) {
      const l = await this.table.get(listingID).run();
      if(!l)
        return null;

      const u = await this.parent.usersTbl.get(l.userID).run();
      const status: 'online' | 'in_game' | 'offline' =
        u.status === 'invisible' || (u.heartbeat < (Date.now() - this.parent.heartbeatTimeout)) ?
          'offline' :
          u.status;

      const tem = await this.parent.temdataTbl.get(l.temID).run();
      return Listing.deserialize(Object.assign(l, {
        user: u.discordName, avatar: u.discordAvatar, status, temName: tem.name, temType: tem.type
      }));
    }

    public async getForUser(userID: string) {
      const u = await this.parent.usersTbl.get(userID).run();
      if(!u) return [];
      const status: 'online' | 'in_game' | 'offline' =
        u.status === 'invisible' || (u.heartbeat < (Date.now() - this.parent.heartbeatTimeout)) ?
          'offline' :
          u.status;

      const listings = await this.table.getAll(userID, { index: 'userID' }).run();

      const uniqueTem = listings.reduce((acc, c) => { if(!acc.includes(c.temID)) acc.push(c.temID); return acc; }, [] as number[]);
      const tem = await this.parent.temdataTbl.getAll(...uniqueTem as any).run();

      return listings.map(l => {
        const t = tem.find(a => a.id === l.temID);
        return Listing.deserialize(Object.assign(l, {
          user: u.discordName, avatar: u.discordAvatar, status, temName: t ? t.name : '', temType: t ? t.type : []
        }));
      });
    }

    public async getForTem(temID: number, opts?: { limit?: number; start?: number; type?: 'sell' }) {
      opts = Object.assign({ limit: 100, start: 0, type: 'sell' }, opts);

      const tem = await this.parent.temdataTbl.get(temID).run();

      const tems = this.table.getAll(temID, { index: 'temID' }).filter(doc => doc('type').eq(opts.type).and(doc('price').ge(0)));
      const temsAndUsers = tems.eqJoin('userID', this.parent.usersTbl);

      // get ingame tems
      const ingameTems = temsAndUsers.filter(doc => doc('right')('status').eq('in_game')
        .and(doc('right')('heartbeat').gt(Date.now() - this.parent.heartbeatTimeout)));

      let ret = await ingameTems.orderBy('price', 'score', 'timestamp').skip(opts.start).limit(opts.limit).run()
        .then(all => all.map(l =>
          Listing.deserialize(Object.assign(l.left, {
            user: l.right.discordName, avatar: l.right.discordAvatar, status: 'in_game' as 'in_game',
            temName: tem.name, temType: tem.type
          }))));
      if(ret.length === opts.limit)
        return ret;

      // get online tems
      const onlineTems = temsAndUsers.filter(doc => doc('right')('status').eq('online')
        .and(doc('right')('heartbeat').gt(Date.now() - this.parent.heartbeatTimeout)));
      const onlineRet = await onlineTems.orderBy('price', 'score', 'timestamp')
        .skip(Math.max(0, opts.start - ret.length)).limit(opts.limit - ret.length).run()
        .then(all => all.map(l =>
          Listing.deserialize(Object.assign(l.left, {
            user: l.right.discordName, avatar: l.right.discordAvatar, status: 'online' as 'online',
            temName: tem.name, temType: tem.type
          }))));
      ret = ret.concat(onlineRet);
      if(ret.length === opts.limit)
        return ret;

      // get offline tems
      const offlineTems = temsAndUsers.filter(doc => doc('right')('status').eq('invisible')
        .or(doc('right')('heartbeat').le(Date.now() - this.parent.heartbeatTimeout)));
      const offlineRet = await offlineTems.orderBy('price', 'score', 'timestamp')
        .skip(Math.max(0, opts.start - ret.length)).limit(opts.limit - ret.length).run()
        .then(all => all.map(l =>
          Listing.deserialize(Object.assign(l.left, {
            user: l.right.discordName, avatar: l.right.discordAvatar, status: 'offline' as 'offline',
            temName: tem.name, temType: tem.type
          }))));

      return ret.concat(offlineRet);
    }

    public async getRecent() {
      const listings = await this.table.orderBy(r.desc('timestamp')).limit(10).run();

      const uids: string[] = [];
      const temids: number[] = [];
      for(const l of listings) {
        if(!uids.includes(l.userID))
          uids.push(l.userID);
        if(!temids.includes(l.temID))
          temids.push(l.temID);
      }

      const users = await this.parent.usersTbl.getAll(...uids).pluck('id', 'discordName', 'discordAvatar', 'status', 'heartbeat').run();
      const tems = await this.parent.temdataTbl.getAll(...temids as any[]).pluck('id', 'name', 'type').run();

      const userInfo: { [key: string]: { user: string; avatar: string; status: 'offline' | 'in_game' | 'online' } } = { };
      for(const u of users) {
        userInfo[u.id] = {
          user: u.discordName,
          avatar: u.discordAvatar,
          status: u.status === 'invisible' || u.heartbeat <= (Date.now() - this.parent.heartbeatTimeout) ?
            'offline' : u.status as 'in_game' | 'online'
        };
      }

      const temInfo: { [key: string]: { temName: string; temType: string[] } } = { };
      for(const t of tems)
        temInfo[t.id] = { temName: t.name, temType: t.type };

      return listings.map(l => Listing.deserialize(Object.assign(l, userInfo[l.userID], temInfo[l.temID])));
    }

  }(this, this.logger);
  public get listings() { return this._listings; }

  async close() {
    return this.pool.drain();
  }
}

export default new DatabaseService();
