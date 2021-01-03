import { Listing } from 'frontend/data/data';

// from: https://github.com/jfromaniello/url-join/blob/master/lib/url-join.js
/**
 * Join urls, akin to `path.join`
 * @param urls The urls to join
 */
export function urljoin(...urls: string[]) {
  if(urls.length <= 0) return '';
  if(urls.length === 1) return urls[0];
  const ret = [];

  // If the first part is a plain protocol, we combine it with the next part.
  if (urls[0].match(/^[^/:]+:\/*$/) && urls.length > 1) {
    const first = urls.shift();
    urls[0] = first + urls[0];
  }

  // There must be two or three slashes in the file protocol, two slashes in anything else.
  if (urls[0].match(/^file:\/\/\//)) {
    urls[0] = urls[0].replace(/^([^/:]+):\/*/, '$1:///');
  } else {
    urls[0] = urls[0].replace(/^([^/:]+):\/*/, '$1://');
  }

  for (let i = 0; i < urls.length; i++) {
    let component = urls[i];

    if (typeof component !== 'string')
      throw new TypeError('Url must be a string. Received ' + component);
    if (component === '') continue;
    else if (i > 0) // Removing the starting slashes for each component but the first.
      component = component.replace(/^[\/]+/, '');
    else if (i < urls.length - 1) // Removing the ending slashes for each component but the last.
      component = component.replace(/[\/]+$/, '');
    else // For the last component we will combine multiple slashes to a single one.
      component = component.replace(/[\/]+$/, '/');

    ret.push(component);
  }

  let str = ret.join('/');
  // Each input component is now separated by a single slash except the possible first plain protocol part.

  // remove trailing slash before parameters or hash
  str = str.replace(/\/(\?|&|#[^!])/g, '$1');

  // replace ? in parameters with &
  const parts = str.split('?');
  str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

  str = str.replace(/([^:])\/+/g, '$1/'); // replace double slashes with single

  return str;
}


export function getTemIcon(temID: number, luma = false) {
  let s_temID = '' + temID;
  s_temID = '000'.slice(s_temID.length) + s_temID;
  return `M${s_temID}_${luma ? 'Luma' : ''}Sprite.png`;
}

export function getDiscordAvatar(userID: string, hash: string) {
  return `https://cdn.discordapp.com/avatars/${userID}/${hash}.png`;
}


let it = 1138;

export function makeMySampleListing(): Listing {
  return {
    id: 'bars-' + it,
    userID: '125676857545719808',
    avatar: 'https://cdn.discordapp.com/avatars/125676857545719808/fd08aa464797f33875948b851cef8d38',
    user: 'Michael Fedora#3269',
    status: 'online',
    type: 'sell',
    timestamp: Date.now(),

    price: Math.round(Math.random() * 10000) + 10000,


    temName: 'Anahir',
    temType: ['Crystal', 'Fire'],
    temID: 161,
    level: Math.round(Math.random() * 50),
    sex: Math.round(Math.random()) ? 'm' : 'f',
    luma: Boolean(Math.round(Math.random())),
    trait: ['Trauma', 'Flawed Crystal'][Math.floor(Math.random() * 2)],
    score: Math.round(Math.random() * 75),
    score_evo: 0,
    svs: {
      hp: Math.round(Math.random() * 50),
      spd: Math.round(Math.random() * 50),
      sta: Math.round(Math.random() * 50),
      atk: Math.round(Math.random() * 50),
      def: Math.round(Math.random() * 50),
      spatk: Math.round(Math.random() * 50),
      spdef: Math.round(Math.random() * 50),
    },
    tvs: {
      hp: Math.round(Math.random() * 50),
      spd: Math.round(Math.random() * 50),
      sta: Math.round(Math.random() * 50),
      atk: Math.round(Math.random() * 50),
      def: Math.round(Math.random() * 200),
      spatk: Math.round(Math.random() * 50),
      spdef: Math.round(Math.random() * 500)
    },
    bred_techniques: [],
    badges: [['clean'], ['prime', 'perfected']][Math.floor(Math.random() * 2)],
  };
}

export function makeListing(): Listing {
  return {
    id: 'foos-' + it,
    userID: '' + (123456789 + it),
    avatar: '',
    user: 'other user#' + it++,
    status: ['online', 'in_game', 'offline'][Math.floor(Math.random() * 3)] as any,
    type: 'sell',
    timestamp: Date.now() - Math.round(Math.random() * 10000) - 10000,

    price: Math.round(Math.random() * 10000) + 10000,


    temName: 'Adoroboros',
    temType: ['Toxic', 'Mental'],
    temID: 129,
    level: Math.round(Math.random() * 50),
    sex: Math.round(Math.random()) ? 'm' : 'f',
    luma: Boolean(Math.round(Math.random())),
    trait: ['Toxic Affinity', 'Amphibian'][Math.floor(Math.random() * 2)],
    score: Math.round(Math.random() * 50),
    score_evo: Math.round(Math.random() * 50) + 50,
    svs: {
      hp: Math.round(Math.random() * 50),
      spd: Math.round(Math.random() * 50),
      sta: Math.round(Math.random() * 50),
      atk: Math.round(Math.random() * 50),
      def: Math.round(Math.random() * 50),
      spatk: Math.round(Math.random() * 50),
      spdef: Math.round(Math.random() * 50),
    },
    tvs: {
      hp: Math.round(Math.random() * 500),
      spd: Math.round(Math.random() * 50),
      sta: Math.round(Math.random() * 50),
      atk: Math.round(Math.random() * 200),
      def: Math.round(Math.random() * 50),
      spatk: Math.round(Math.random() * 50),
      spdef: Math.round(Math.random() * 50)
    },
    bred_techniques: ['Tsunami', 'Water Blade'],
    badges: [['prime'], ['clean', 'perfected']][Math.floor(Math.random() * 2)],
  };
}
