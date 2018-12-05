import { URL } from 'url';


export class MockLocation {
  protocol = '';
  host = '';
  hostname = '';
  port = '';
  pathname = '';
  search = '';
  hash = '';
  username  = '';
  password = '';
  origin = '';

  private _href = '';
  get href() {
    return this._href;
  }
  set href(value) {
    const url = new URL(value);
    this.protocol = url.protocol;
    this.host = url.host;
    this.port = url.port;
    this.pathname = url.pathname;
    this.search = url.search;
    this.hash = url.hash;
    this.username = url.username;
    this.password = url.password;
    this.origin = url.origin;
  }

  assign(_url: string) {
    //
  }

  reload(_forcedReload?: boolean) {
    //
  }

  replace(_url: string) {
    //
  }

  toString() {
    return this.href;
  }

}