
export interface Stats {
  hp: number;
  sta: number;
  spd: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
}


export interface PartialListing {
  type: 'sell'; // | 'buy' | 'auction'

  temID: string;

  luma: boolean;
  level: number;
  sex: 'm' | 'f';
  svs: Stats;
  tvs: Stats;
  trait: string;
  bred_techniques: string[];
}

export interface Listing extends PartialListing {
  id: string;
  userID: string;
  status: 'online' | 'in_game' | 'offline';
  user: string; // name

  price: number; // currentBidder
  created: number;

  name: string; // tem name

  score: number; // sqrt(sum( ((sv/50)^2 + (tv/500)) * base^2 )).toFixed(2)
  score_evo: number; // same as above but use final evolution. if no evolution, make 0

  // 'prime' (all 50 svs)
  // 'clean' (0 tvs, +20 score)
  // 'perfected' (500 tvs in top two base stats)
  badges: string[];
}

export interface Temtem {
  id: number;

  name: string;

  type: string[];
  stats: Stats;
  traits: string[];
  bred_techniques: string[];

  evolution: number[];

  max_score: number;
}

export interface User {
  id: string;

  discordAvatar: string;
  discordName: string;

  temUserID: string;
  temUserName: string;

  status: 'online' | 'in_game' | 'invisible';
  heartbeat: number;
}
