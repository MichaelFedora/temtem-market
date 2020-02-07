export interface Stats {
  hp: number;
  sta: number;
  spd: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
}

export class TemtemEntry {
  id: string; // uuid
  tem_id: number;
  name: string;
  type: string[];
  base: Stats;
  sv: Stats;
  tv: Stats;
  trait: string;
  bred_techniques: string[];
  egged: boolean;

  constructor(id: string, tem_id: number, name: string, type: string[], base: Stats, sv: Stats, tv: Stats, trait: string, bred_techniques: string[], egged: boolean) {
    this.id = id;
    this.tem_id = tem_id;
    this.name = name;
    this.type = type.slice();
    this.base = Object.assign({ }, base);
    this.sv = Object.assign({ }, sv);
    this.tv = Object.assign({ }, tv);
    this.trait = trait;
    this.bred_techniques = bred_techniques.slice();
    this.egged = egged;
  }
}

export class TemtemType {
  id: number;
  name: string;
  type: string[];
  stats: Stats;
  traits: string[];
  bred_techniques: string[];

  createEntry(sv: Stats, tv: Stats, trait: string, bred_techniques: string[], egged: boolean) {
    if(!this.traits.includes(trait))
      throw new Error('Trait "' + trait + '" is not included in Temtem type "' + this.name + '"!');
    if(bred_techniques.find(a => !this.bred_techniques.includes(a)))
      throw new Error('Bred Technique "' + trait + '" is not included in Temtem type "' + this.name + '"!');

    return new TemtemEntry('', this.id, this.name, this.type, this.stats, sv, tv, trait, bred_techniques, egged);
  }

  constructor(entry: { id: number, name: string, type: string[], stats: Stats, traits: string[], bred_techniques: string[] }) {
    this.id = entry.id;
    this.name = entry.name;
    this.type = entry.type.slice();
    this.stats = Object.assign({ }, entry.stats);
    this.traits = entry.traits.slice();
    this.bred_techniques = entry.bred_techniques.slice();
  }
}
