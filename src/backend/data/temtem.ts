export interface Stats {
  hp: number;
  sta: number;
  spd: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
}

export interface Temtem {
  id: number;

  name: string;

  type: string[];
  stats: Stats;
  traits: string[];
  bred_techniques: string[];

  evolution: number[];

  score: number;
}
