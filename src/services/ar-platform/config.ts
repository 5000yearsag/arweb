import { request, history } from '@umijs/max';

import type { RequestOptions } from '@@/plugin-request/request';

class ArPlatformServiceConfig {
  private _urlPrefix: string = '';
  private _token: string = '';

  private _loginPath = '/user/login';

  constructor(options: { urlPrefix?: string; loginPath?: string } = {}) {
    const { urlPrefix, loginPath } = options;
    this._urlPrefix = urlPrefix ?? '';
    if (typeof loginPath === 'string') {
      this._loginPath = loginPath;
    }
    const cachedToken = window.localStorage.getItem('token');
    if (!!cachedToken) this._token = cachedToken;
  }

  get token() {
    return this._token;
  }

  set token(t: string) {
    this._token = t;
    window.localStorage.setItem('token', t);
  }

  get urlPrefix() {
    return this._urlPrefix;
  }

  customizeRequestConfig = (config: any): RequestOptions => {
    const url = `${this._urlPrefix || ''}${config?.url || ''}`;
    const headers: any = {
      ...(config?.headers || {}),
      'Content-Type': 'application/json',
    };
    if (!!this._token && !config?.isPublicApi) headers.Token = this._token || '';
    return {
      ...config,
      headers,
      url,
    };
  };

  logout = () => {
    if (this._loginPath) {
      history.push(this._loginPath);
    }
  };

  static customizeRequest = <T>(url: string, opts?: RequestOptions) => {
    return request<T>(url, opts || {}).then((res) => {
      const { data } = (res || {}) as any;
      return data as T;
    });
  };
}

export default ArPlatformServiceConfig;
