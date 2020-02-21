
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
