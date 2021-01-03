import { Stats } from './temtem';

export interface SerializedListing {
  id?: string;
  userID: string;
  type: 'sell';
  price: number;
  timestamp: number;

  temID: number;
  temName: string;

  luma: boolean;
  level: number;
  sex: 'm' | 'f';
  svs: Stats;
  tvs: Stats;
  trait: string;
  fertility: number;
  bred_techniques: string[];

  score: number;
  score_evo: number;

  badges: string[];
}

export interface PartialListing {
  type: 'sell';

  temID: number;

  luma: boolean;
  level: number;
  sex: 'm' | 'f';
  svs: Stats;
  tvs: Stats;
  trait: string;
  fertility: number;
  bred_techniques: string[];
  price: number;
}

export class Listing implements SerializedListing, PartialListing {
  id: string;
  userID: string;
  status?: 'online' | 'in_game' | 'offline';
  user?: string; // user name
  avatar?: string; // user avatar
  type: 'sell';// | 'buy' | 'auction'

  price: number; // currentBidder
  timestamp: number;

  temID: number;
  temName: string;
  temType: string[];

  luma: boolean;
  level: number;
  svs: Stats;
  sex: 'm' | 'f';
  tvs: Stats;
  trait: string;
  fertility: number;
  bred_techniques: string[];

  score: number; // sqrt(sum( ((sv/50)^2 + (tv/500)) * base^2 )).toFixed(2)
  score_evo: number; // same as above but use final evolution. if no evolution, make 0

  // 'prime' (all 50 svs)
  // 'clean' (0 tvs, +20 score)
  // 'perfected' (500 tvs in top two base stats)
  badges: string[];

  constructor(listing: Partial<Listing> = { type: 'sell' }) {
    this.id = String(listing.id || '');

    this.userID = String(listing.userID || '');
    if(!['sell'].includes(listing.type))
      throw new Error('Invalid listing type: "' + listing.type + '"!');

    this.status = String(listing.status || '') as any || undefined;
    this.user = String(listing.user || '') || undefined;
    this.avatar = String(listing.avatar || '') || undefined;

    this.price = Number(listing.price || -1);
    this.timestamp = Number(listing.timestamp || 0);
    this.type = listing.type;

    this.temID = Number(listing.temID) || 0;
    this.temName = String(listing.temName || '');
    this.temType = listing.temType && listing.temType instanceof Array ? listing.temType.slice() : [];
    this.luma = Boolean(listing.luma || false);

    this.level = Number(listing.level || 0);
    this.sex = String(listing.sex || '') as any;
    this.svs = Object.assign({ hp: 0, sta: 0, spd: 0, atk: 0, def: 0, spatk: 0, spdef: 0 }, listing.svs);
    this.tvs = Object.assign({ hp: 0, sta: 0, spd: 0, atk: 0, def: 0, spatk: 0, spdef: 0 }, listing.tvs);
    this.trait = String(listing.trait || '');
    this.fertility = Number(listing.fertility) || 0;
    this.bred_techniques = (listing.bred_techniques && listing.bred_techniques instanceof Array) ?
      listing.bred_techniques.map(a => String(a)) :
      [];

    this.score = Number(listing.score || 0);
    this.score_evo = Number(listing.score_evo || 0);

    this.badges = (listing.badges && listing.badges instanceof Array) ?
      listing.badges.map(a => String(a)) :
      [];
  }

  public serialize(noId = false): SerializedListing {
    const l: SerializedListing = Object.assign({ }, this);
    if(this.status)
      delete (l as any).status;
    if(this.user)
      delete (l as any).user;
    if(this.avatar)
      delete (l as any).avatar;
    if(this.temName)
      delete (l as any).temName;
    if(this.temType)
      delete (l as any).temType;
    if(noId)
      delete l.id;
    return l;
  }

  public static deserialize(obj: SerializedListing & {
    user: string; avatar: string; status: Listing['status']; temName: string; temType: string[];
  }): Listing {
    return new Listing(obj);
  }
}
