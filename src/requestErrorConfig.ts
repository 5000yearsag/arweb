import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message } from 'antd';

import ArPlatformServiceConfig from '@/services/ar-platform/config';
import { errorCode2Message } from '@/constants/error';

// const isDev = process.env.NODE_ENV === 'development';

// 与后端约定的响应数据格式
interface ResponseStructure {
  data: any;
  success: boolean;
  returnCode: number;
  returnDesc?: string;
}

export const arPlatformServiceConfigInstance = new ArPlatformServiceConfig({
  urlPrefix: '', //isDev ? '' : 'http://123.57.231.35:8081',
});

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    errorThrower: (res) => {
      const { returnCode, returnDesc } = res as unknown as ResponseStructure;
      if (returnCode !== 17000) {
        const errorMessage = errorCode2Message[returnCode] ?? returnDesc;
        const err: any = new Error(errorMessage);
        err.name = 'BizError';
        err.info = res;
        throw err;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.name === 'BizError') {
        const errorMessage = error.message;
        const { status } = error.info || {};
        message.error(errorMessage);
        if (status === 401) {
          arPlatformServiceConfigInstance.logout();
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const { returnCode, returnDesc } = error.response.data || {};
        const errorMessage =
          returnCode !== 17000 && !!returnDesc
            ? returnDesc
            : `Response status:${error.response.status}`;
        message.error(errorMessage);
        if (error.response.status === 401) {
          arPlatformServiceConfigInstance.logout();
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const newConfig = arPlatformServiceConfigInstance.customizeRequestConfig(config);
      return newConfig;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as any;
      const { returnCode } = data as unknown as ResponseStructure;
      data.success = returnCode === 17000;
      return response;
    },
  ],
};
