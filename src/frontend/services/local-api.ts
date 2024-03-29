import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Temtem, Listing, PartialListing, User, PublicUser } from '../data/data';
import { interval } from 'rxjs';

class LocalApi {

  private _sid: string;
  public get sid() { return this._sid; }
  public set sid(v: string) {
    if(v)
      localStorage.setItem('sid', v);
    else
      localStorage.removeItem('sid');

    this._sid = v;
  }

  public async heartbeat() {
    if(!this.sid)
      return;

    // console.debug('heartbeat - ', new Date().toISOString());

    await axios.post(`${this.userOrigin}/heartbeat`, null, this.reqConf)
      .catch((e: AxiosError) => console.error('Failed to update heartbeat: ', e));
  }

  constructor() {
    this.sid = localStorage.getItem('sid') || '';

    interval(40000).subscribe(() => this.heartbeat());
  }

  private get reqConf(): AxiosRequestConfig {
    return { params: { sid: this.sid } };
  }

  // #region User

  private get userOrigin() {
    return `${location.origin}/api/user`;
  }

  public get discordLoginURL() {
    return `${this.userOrigin}/login`;
  }

  public async register(name: string, avatar: string, temUserName: string, temUserID: string) {
    if(!this.sid)
      throw new Error('No SID!');
    await axios.post(`${this.userOrigin}/register`, {
      name,
      avatar,
      temUserName,
      temUserID,
    }, this.reqConf);
  }

  public async logout(keepSID = false) {
    if(!this.sid)
      throw new Error('No SID!');

    await axios.post(`${this.userOrigin}/logout`, null, this.reqConf);
    if(!keepSID)
      this.sid = undefined;
  }

  public async getSelf() {
    if(!this.sid)
      throw new Error('No SID!');

    return axios.get<User>(`${this.userOrigin}/`, this.reqConf).then(r => r.data);
  }

  public async updateTemInfo(info: Partial<{ temUserName: string; temUserID: string }>) {
    if(!this.sid)
      throw new Error('No SID!');

    return axios.put(`${this.userOrigin}/tem-info`, info, this.reqConf);
  }

  public async deleteSelf() {
    if(!this.sid)
      throw new Error('No SID!');

    await axios.delete(`${this.userOrigin}/`, this.reqConf);
  }

  public async gdpr() {
    if(!this.sid)
      throw new Error('No SID!');

    return axios.get(`${this.userOrigin}/gdpr`, this.reqConf).then(r => r.data);
  }

  public get gdprLink(): string {
    if(!this.sid)
      return '';
    return `${this.userOrigin}/gdpr?sid=${this.sid}`;
  }

  public async changeStatus(status: 'in_game' | 'online' | 'invisible') {
    if(!this.sid)
      throw new Error('No SID!');

    const reqConf = this.reqConf;
    if(!reqConf.headers)
      reqConf.headers = { };
    reqConf.headers['Content-Type'] = 'text/plain';

    await axios.put(`${this.userOrigin}/status`, status, reqConf);
  }

  public async getUser(id: string) {
    return axios.get<PublicUser>(`${this.userOrigin}/${id}`).then(res => res.data);
  }

  // #endregion

  // #region Tem

  private get temOrigin() {
    return `${location.origin}/api/tem`;
  }

  public async getAllTem() {
    return axios.get<Temtem[]>(`${this.temOrigin}/`).then(r => r.data);
  }

  public async search(text: string, options?: { limit?: number; start?: number }) {
    const reqConf: AxiosRequestConfig = { params: { q: text } };

    if(options.limit)
      reqConf.params.limit = options.limit;
    if(options.start)
      reqConf.params.start = options.start;

    return axios.get<Temtem[]>(`${this.temOrigin}/search`, reqConf).then(r => r.data);
  }

  public async getListing(id: string) {
    return axios.get<Listing>(`${this.temOrigin}/listings/${id}`);
  }

  public async getListingsForTem(id: string, options?: { start?: number; limit?: number; type?: 'sell' }) {
    options = Object.assign({ }, options);

    const reqConf: AxiosRequestConfig = { params: { id: id } };

    if(options.limit)
      reqConf.params.limit = options.limit;
    if(options.start)
      reqConf.params.start = options.start;
    if(options.type)
      reqConf.params.type = options.type;

    return axios.get<Listing[]>(`${this.temOrigin}/listings/tem/${id}`).then(r => r.data);
  }

  public async getListingsForUser(id: string) {
    return axios.get<Listing[]>(`${this.temOrigin}/listings/user/${id}`).then(r => r.data);
  }

  public async getRecentListings() {
    return axios.get<Listing[]>(`${this.temOrigin}/listings/recent`).then(r => r.data);
  }

  public async getMyListings() {
    if(!this.sid)
      throw new Error('No SID!');

    return axios.get<Listing[]>(`${this.temOrigin}/my/listings`, this.reqConf).then(r => r.data);
  }

  public async addListing(listing: PartialListing) {
    if(!this.sid)
      throw new Error('No SID!');

    return axios.post<Listing>(`${this.temOrigin}/my/listings`, listing, this.reqConf).then(r => r.data);
  }

  public async updateListing(id: string, listing: PartialListing) {
    if(!this.sid)
      throw new Error('No SID!');

    await axios.put(`${this.temOrigin}/my/listings/${id}`, listing, this.reqConf);
  }

  public async deleteListing(id: string) {
    if(!this.sid)
      throw new Error('No SID!');

    await axios.delete(`${this.temOrigin}/my/listings/${id}`, this.reqConf);
  }

  // #endregion
};

export default new LocalApi();
