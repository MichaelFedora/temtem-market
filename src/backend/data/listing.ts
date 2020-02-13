import { Stats } from './temtem';

export interface SerializedListing {
  id?: string;
  userID: string;
  type: 'sell';
  price: number;
  created: number;

  temID: string;
  name: string;

  luma: boolean;
  level: number;
  svs: Stats;
  tvs: Stats;
  trait: string;
  bred_techniques: string[];

  score: number;
  score_evo: number;

  badges: string[];
}

export interface PartialListing {
  userID: string;
  type: 'sell';

  temID: string;

  luma: boolean;
  level: number;
  svs: Stats;
  tvs: Stats;
  trait: string;
  bred_techniques: string[];
}

export class Listing implements SerializedListing {
  id: string;
  userID: string;
  status?: 'online' | 'in_game' | 'offline';
  user?: string; // name
  type: 'sell';// | 'buy' | 'auction'

  price: number; // currentBidder
  created: number;

  temID: string;
  name: string;

  luma: boolean;
  level: number;
  svs: Stats;
  tvs: Stats;
  trait: string;
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

    this.status = String(listing.status) as any || undefined;
    this.user = String(listing.user) || undefined;

    this.price = Number(listing.price || -1);
    this.created = Number(listing.created || 0);
    this.type = listing.type;

    this.temID = String(listing.temID || '');
    this.name = String(listing.name || '');
    this.luma = Boolean(listing.luma || false);

    this.level = Number(listing.level || 0);
    this.svs = Object.assign({ hp: 0, sta: 0, spd: 0, atk: 0, def: 0, spatk: 0, spdef: 0 }, listing.svs);
    this.tvs = Object.assign({ hp: 0, sta: 0, spd: 0, atk: 0, def: 0, spatk: 0, spdef: 0 }, listing.tvs);
    this.trait = String(listing.trait || '');
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
    if(noId)
      delete l.id;
    return l;
  }

  public static deserialize(obj: SerializedListing & { user: string; status: string }): Listing {
    return new Listing(obj);
  }
}
