declare namespace AR_API {
  type UploadFileResponse = {
    dimensions: string;
    url: string;
  };

  type LoginBody = {
    username: string;
    password: string;
    captcha: string;
    randomStr: string;
  };

  type ResetPasswordBody = {
    newPassword: string;
    oldPassword: string;
    captcha: string;
    randomStr: string;
  };

  type UserInfo = {
    id: string;
    username: string;
    access: 'admin';
    status: 0 | 1; // 0 禁用 1 正常
    name?: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };

  type PagedListParams = {
    pageNum: number;
    pageSize: number;
    [key: string]: any;
  };

  type PagedListResult<T extends any> = {
    list: T[];
    pageNum: number;
    pageSize: number;
    total: number;
  };

  type CollectionListItem = {
    id: string;
    collectionUuid: string;
    collectionName: string;
    coverImgUrl: string;
    description: string;
    collectionAppList: AppListItem[];
    templateId: string;
    sceneCount: number;
    pvCount: number;        // 打开
    click1Count: number;    // 进入
    click2Count: number;    // 播放
    click3Count: number;    // 拍照分享
    click4Count: number;    // 录像分享
    click5Count: number;    // 资源加载
  };

  type AppListItem = {
    id: string;
    appId: string;
    appName: string;
    collectionUuid: string;
    wxImgUrl: string;
    wxJumpParam: string;
    appSecret: string;
  };

  type SceneListItem = {
    id: string;
    sceneUuid: string;
    sceneName: string;
    sceneImgUrl: string;
    collectionUuid: string;
    arResourceUrl: string;
    arResourceType: 'video' | 'model';
    arResourceFileName?: string;
    audioResourceUrl?: string;
    audioResourceFileName?: string;
    arResourceDimension: string;
    spaceParam: string;
    status: 0 | 1; // 0 禁用 1 正常
    videoEffect?: string;
  };

  type AddCollectionBody = {
    collectionName: string;
    description: string;
    coverImgUrl: string;
    wxAppInfoList: {
      appId: string;
      wxJumpParam: string;
    }[];
    templateId: string;
  };

  type AddAppBody = {
    appId: string;
    appName: string;
    appSecret: string;
    wxJumpParam: string;
  };

  type DeleteAppBody = {
    id: string;
    appId: string;
  };

  type SceneSwitchBody = {
    // id: string;
    sceneUuid: string;
    status: 0 | 1;
  };

  type AddSceneBody = {
    sceneName: string;
    sceneImgUrl: string;
    collectionUuid: string;
    arResourceUrl: string;
    arResourceDimension: string;
    spaceParam: string;
    arResourceFileName?: string;
    audioResourceUrl?: string;
    audioResourceFileName?: string;
    videoEffect?: string;
    extraJson?: string;
  };

  type TemplateListItem = {
    id: string;
    templateName: string;
    brandName: string;
    shareImgUrl: string;
    bgImgUrl: string;
  };

  type AddTemplateBody = {
    templateName: string;
    brandName: string;
    shareImgUrl: string;
    bgImgUrl: string;
  };

  type DashboardStats = {
    totalCollections: number;
    totalScenes: number;
    totalAccess: number;
    totalUsers: number;
  };
}
