import { r, MasterPool, RTable, RDatabase } from 'rethinkdb-ts';
import { User, SerializedUser } from '../data/user';
import { NotFoundError } from '../data/errors';
import { getLogger, Logger } from 'log4js';
import { Session } from '../data/session';
import { Config } from '../data/config';
import { SerializedListing, PartialListing, Listing } from '../data/listing';
import { SerializedTemtem, Stats } from '../data/temtem';
import { readJSONSync } from 'fs-extra';
import { calcScore, stat_50, stat_0 } from '../util';

interface IDBService {
  db: RDatabase;
  sessionExpTime: number;
  usersTbl: RTable<SerializedUser>;
  sessionsTbl: RTable<Session>;
  temdataTbl: RTable<SerializedTemtem>;
  listingsTbl: RTable<SerializedListing>;
}

class DatabaseService implements IDBService {

  private pool: MasterPool;
  private logger = getLogger('services.db');

  public get tableNames() { return [ 'users', 'sessions', 'temdata', 'listings' ]; }

  private config: Config;

  public get dbName() { return this.config.db; }
  public get sessionExpTime() { return this.config.sessionExpTime; }

  public get db() { return r.db(this.dbName); }

  public get usersTbl(): RTable<SerializedUser> { return this.db.table('users'); }
  public get sessionsTbl(): RTable<Session> { return this.db.table('sessions'); }
  public get temdataTbl(): RTable<SerializedTemtem> { return this.db.table('temdata'); }
  public get listingsTbl(): RTable<SerializedListing> { return this.db.table('listings'); }

  public async init(config: Config): Promise<void> {
    this.config = config;
    this.pool = await r.connectPool({ host: config.db_host, port: config.db_port });

    r.dbList().contains(this.dbName).not().run().then(async result => {
      if(!result)
        await r.dbCreate(this.dbName).run().then(a => this.logger.info(`Created db "${this.dbName}!`));
    });

    await r(this.tableNames).difference(this.db.tableList()).run().then(async result => {
      for(const tableName of result)
        await this.db.tableCreate(tableName).run().then(a => this.logger.info(`Created table "${tableName}"!`));
    });

    this.users.init();
    this.sessions.init();
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
      return User.deserialize(user);
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
  }(this, this.logger);
  public get sessions() { return this._sessions; }


  private _temdata = new class TemData {
    constructor(private parent: IDBService, private logger: Logger) { }

    public get table(): RTable<SerializedTemtem> { return this.parent.temdataTbl; }

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
      }[] = readJSONSync('temdata.json');

      for(const entry of data) {
        entry.score = calcScore(entry.stats, stat_50, stat_0);
        await this.table.insert(data, { conflict: 'replace' }).run();
      }
    }

    public async getAll() {
      return this.table.run();
    }

    public async search(text: string, limit = 20) {
      limit = Math.min(1, Math.max(50, limit));
      const groups = text.split(/\W/).filter(a => a);
      return this.table
        .filter(doc => doc('name').match(`(?i)${groups.map(a => `(?:${a})`)})`).ne(null))
        .limit(limit).run();
    }

  }(this, this.logger);


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
        listing.svs[k] = listing.svs[k] ? Math.round(Math.min(0, Math.max(50, listing.svs[k]))) : 0;
        listing.tvs[k] = listing.tvs[k] ? Math.round(Math.min(0, Math.max(50, listing.tvs[k]))) : 0;
      }

      if(!tem.traits.includes(listing.trait))
        listing.trait = 'Unknown';

      listing.bred_techniques = listing.bred_techniques.filter(a => tem.bred_techniques.includes(a));

      // generate score

      let score = calcScore(tem.stats, listing.svs, listing.tvs);

      let score_evo = 0;
      const evo_id = tem.evolution.length ? tem.evolution[tem.evolution.length - 1] : null;
      if(evo_id) {
        const tem_evo = await this.parent.temdataTbl.get(evo_id).run();

        score_evo = calcScore(tem_evo.stats, listing.svs, listing.tvs);
      }

      // generate badges

      const badges: string[] = [];

      if(!Object.values(listing.svs).find(a => a < 50)) {
        badges.push('prime');
        score += 5;
        if(score_evo > 0)
          score_evo += 5;
      }

      if(!Object.values(listing.tvs).find(a => a > 0)) {
        badges.push('clean');
        score += 20;
        if(score_evo > 0)
          score_evo += 20;
      }

      const topTwo = Object.entries(tem.stats).sort(([k, v], [k2, v2]) => v - v2).slice(0, 2).map(([k, v]) => k);
      if(!(listing.tvs[topTwo[0]] < 500 || listing.tvs[topTwo[1]] < 500)) {
        badges.push('perfected');
        score += 5;
        if(score_evo > 0)
          score_evo += 5;
      }

      return new Listing(Object.assign({ }, listing, {
        userID,
        name: tem.name,
        bred_techniques: listing.bred_techniques,
        trait: listing.trait,
        score,
        score_evo,
        badges
      } as Partial<Listing>));
    }

    public async add(userID: string, listing: PartialListing) {
      const actual = await this.makeListing(userID, listing);
      const result = await this.table.insert(listing).run();
      actual.id = result.generated_keys[0];
      return actual;
    }

    public async update(id: string, userID: string, listing: PartialListing) {
      const actual = await this.makeListing(userID, listing);
      await this.table.get(id).update(actual).run();
    }

    public async delete(listingID: string) {
      await this.table.get(listingID).delete().run();
    }

    public async get(listingID: string) {
      return this.table.get(listingID).run();
    }

    public async getForUser(userID: string) {
      return this.table.getAll(userID, { index: 'userID' }).run();
    }

    public async getForTem(temID: string, opts?: { page: number; type: 'sell' }) {
      opts = Object.assign({ page: 0, type: 'sell' }, opts);

      return this.table.getAll(temID, { index: 'temID' })
        .filter(doc => doc('type').eq(opts.type))
        .skip(opts.page * 100).limit(100).run();
    }

  }(this, this.logger);
  public get listings() { return this._listings; }

  async close() {
    return this.pool.drain();
  }
}

export default new DatabaseService();