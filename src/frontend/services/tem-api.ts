import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Temtem, Listing, PartialListing, User } from '../data/data';
import { interval } from 'rxjs';

class TemApi {

  private _sid: string;
  public get sid() { return this._sid; }
  public set sid(v: string) {
    if(v)
      localStorage.setItem('sid', v);
    else
      localStorage.removeItem('sid');

    this._sid = v;
  }

  private async heartbeat() {
    if(!this.sid)
      return;

    await axios.post(`${this.userOrigin}/heartbeat`, null, this.reqConf)
      .catch((e: AxiosError) => console.error('Failed to update heartbeat: ', e));
  }

  constructor() {
    this.sid = localStorage.getItem('sid') || '';

    interval(40000).subscribe(this.heartbeat);
  }

  private get reqConf(): AxiosRequestConfig {
    return { params: { sid: this.sid } };
  }

  // #region User

  private get userOrigin() {
    return `${location.origin}/api/user`;
  }

  public get discordLoginURL() {
    return `${this.userOrigin}/login/discord`;
  }

  public async register(name: string, avatar: string, temUserName: string, temUserID: string) {
    if(!this.sid)
      throw new Error('No SID!');
    await axios.post(`${this.userOrigin}/user/register`, {
      name,
      avatar,
      temUserName,
      temUserID,
    }, this.reqConf);
  }

  public async logout(keepSID = false) {
    if(!this.sid)
      throw new Error('No SID!');

    await axios.post(`${this.userOrigin}/logout`, this.reqConf);
    if(!keepSID)
      this.sid = undefined;
  }

  public async getSelf() {
    if(!this.sid)
      throw new Error('No SID!');

    return axios.get<User>(`${this.userOrigin}/`, this.reqConf).then(r => r.data);
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

  public async changeStatus(status: 'in_game' | 'online' | 'invisible') {
    if(!this.sid)
      throw new Error('No SID!');

    await axios.put(`${this.userOrigin}/status`, status, this.reqConf);
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
    const reqConf: AxiosRequestConfig = { params: { id: id } };

    if(options.limit)
      reqConf.params.limit = options.limit;
    if(options.start)
      reqConf.params.start = options.start;
    if(options.type)
      reqConf.params.type = options.type;

    return axios.get<Listing[]>(`${this.temOrigin}/tem/${id}`).then(r => r.data);
  }

  public async getListingsForUser(id: string) {
    return axios.get<Listing[]>(`${this.temOrigin}/user/${id}`).then(r => r.data);
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

export default new TemApi();
