export interface Stats {
  hp: number;
  sta: number;
  spd: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
}

export interface SerializedTemtem {
  id: number;

  name: string;

  type: string[];
  stats: Stats;
  traits: string[];
  bred_techniques: string[];

  evolution: number[];

  max_score: number;
}

export class Temtem {
  id: number;

  name: string;

  type: string[];
  stats: Stats;
  traits: string[];
  bred_techniques: string[];

  evolution: number[];

  max_score: number;
}
