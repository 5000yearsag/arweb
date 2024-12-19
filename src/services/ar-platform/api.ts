// @ts-ignore
/* eslint-disable */
import type { RequestOptions } from '@@/plugin-request/request';
import ArPlatformServiceConfig from './config';

const request = ArPlatformServiceConfig.customizeRequest;

export async function getCaptchaForLogin(randomStr: string): Promise<string> {
  return request<string>(`/api/sys/code`, {
    method: 'POST',
    data: { randomStr },
    isPublicApi: true,
  });
}

export async function sysLogin(params: AR_API.LoginBody): Promise<{ token: string }> {
  return request<{ token: string }>('/api/token/login', {
    method: 'POST',
    params,
    skipErrorHandler: true,
    isPublicApi: true,
  });
}

export async function sysLogout() {
  return request('/api/sys/logout');
}

export async function resetUserPassword(body: AR_API.ResetPasswordBody) {
  return request('/api/sys/user/resetPassword', {
    method: 'POST',
    data: body,
  });
}

export async function getSysUserInfo(): Promise<AR_API.UserInfo> {
  return request<AR_API.UserInfo>('/api/sys/user/getMe').then((res) => {
    if (res) res.access = 'admin';
    return res;
  });
}

export async function getCollectionList(
  body: AR_API.PagedListParams,
): Promise<AR_API.PagedListResult<AR_API.CollectionListItem>> {
  return request<AR_API.PagedListResult<AR_API.CollectionListItem>>(
    '/api/collection/getAllCollection',
    {
      method: 'POST',
      data: body,
    },
  );
}

export async function getCollectionByUuid(
  collectionUuid: string,
): Promise<AR_API.CollectionListItem> {
  return request<AR_API.CollectionListItem>('/api/collection/getCollectionByUuid', {
    method: 'POST',
    data: {
      collectionUuid,
    },
  });
}

export async function addCollection(body: AR_API.AddCollectionBody) {
  return request('/api/collection/addCollection', {
    method: 'post',
    data: body,
  });
}

export async function editCollection(body: { collectionUuid: string } & AR_API.AddCollectionBody) {
  return request('/api/collection/updateCollection', {
    method: 'post',
    data: body,
  });
}

export async function deleteCollection(collectionUuid: string) {
  return request('/api/collection/deleteCollection', {
    method: 'POST',
    data: {
      collectionUuid,
    },
  });
}

export async function getAllAppList(): Promise<AR_API.PagedListResult<AR_API.AppListItem>> {
  return request<AR_API.PagedListResult<AR_API.AppListItem>>('/api/wxapp/getAllWxAppList');
}

export async function getAppByAppId(body: {
  id: string;
  appId: string;
}): Promise<AR_API.AppListItem> {
  return request<AR_API.AppListItem>('/api/wxapp/getAppByAppId', {
    method: 'POST',
    data: body,
  });
}

export async function addApp(body: AR_API.AddAppBody) {
  return request('/api/wxapp/addApp', {
    method: 'POST',
    data: body,
  });
}

export async function editApp(body: { id: string } & AR_API.AddAppBody) {
  return request('/api/wxapp/updateApp', {
    method: 'POST',
    data: body,
  });
}

export async function deleteApp(body: AR_API.DeleteAppBody) {
  return request('/api/wxapp/deleteApp', {
    method: 'POST',
    data: body,
  });
}

export async function getCollectionSecenList(
  body: AR_API.PagedListParams,
): Promise<AR_API.PagedListResult<AR_API.SceneListItem>> {
  return request<AR_API.PagedListResult<AR_API.SceneListItem>>(
    '/api/scene/getAllSceneByCollection',
    {
      method: 'POST',
      data: body,
    },
  );
}

export async function getSceneByUuid(sceneUuid: string): Promise<AR_API.SceneListItem> {
  return request<AR_API.SceneListItem>('/api/scene/getScene', {
    method: 'POST',
    data: {
      sceneUuid,
    },
  });
}

export async function triggerSwitchScene(body: AR_API.SceneSwitchBody) {
  return request('/api/scene/changeSceneStatus', {
    method: 'POST',
    data: body,
  });
}

export async function addScene(body: AR_API.AddSceneBody) {
  return request('/api/scene/addScene', {
    method: 'POST',
    data: {
      ...(body || {}),
      description: '',
    },
  });
}

export async function editScene(
  body: {
    id: string;
    sceneUuid: string;
  } & AR_API.AddSceneBody,
) {
  return request('/api/scene/updateScene', {
    method: 'POST',
    data: {
      ...(body || {}),
      description: '',
    },
  });
}

export async function deleteScene(sceneUuid: string) {
  return request('/api/scene/deleteScene', {
    method: 'POST',
    data: {
      sceneUuid,
    },
  });
}

export async function uploadFile(
  url: string,
  file: any,
  opts?: RequestOptions,
): Promise<AR_API.UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return request<AR_API.UploadFileResponse>(url, {
    method: 'POST',
    data: formData,
    skipErrorHandler: true,
    ...(opts || {}),
  });
}
