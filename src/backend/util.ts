import { Stats } from './data/temtem';
import { Listing } from './data/listing';

export const listing_types: readonly (Listing['type'])[] = Object.freeze(['sell']);

export const stat_keys: readonly (keyof Stats)[] = Object.freeze([ 'hp', 'sta', 'spd', 'atk', 'def', 'spatk', 'spdef' ]);
export const stat_50: Stats = {
  hp: 50,
  sta: 50,
  spd: 50,
  atk: 50,
  def: 50,
  spatk: 50,
  spdef: 50
};

export const stat_0: Stats = {
  hp: 0,
  sta: 0,
  spd: 0,
  atk: 0,
  def: 0,
  spatk: 0,
  spdef: 0
};

export function calcScore(base: Stats, svs: Stats, tvs: Stats) {
  return Math.round(
    Math.sqrt(
      stat_keys.map(
        k => (Math.pow(svs[k] / 50, 2) + tvs[k] / 500) * Math.pow(base[k], 2))
        .reduce((acc, v) => acc + v, 0)
    )
  );
}
