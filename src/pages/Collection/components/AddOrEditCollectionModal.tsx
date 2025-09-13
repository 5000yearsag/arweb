import React, { useState, useMemo, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormUploadButton,
  ProFormSwitch,
} from '@ant-design/pro-components';

import type { ModalFormProps } from '@ant-design/pro-components';

import { customUploadRequest } from '@/utils';
import {
  getAllAppList,
  getCollectionByUuid,
  addCollection,
  editCollection,
  getAllTemplateList
} from '@/services/ar-platform/api';

const useAppList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [appList, setAppList] = useState<any[]>([]);

  const loadAllAppList = useCallback(() => {
    (async () => {
      setLoading(true);
      const res = await getAllAppList().finally(() => setLoading(false));
      const newList = Array.isArray(res) ? res : [];
      setAppList(newList);
    })();
  }, []);

  return {
    loading,
    list: appList,
    loadAllAppList,
  };
};

const useTemplateList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [templateList, setTemplateList] = useState<any[]>([]);

  const loadAllTemplateList = useCallback(() => {
    (async () => {
      setLoading(true);
      const res = await getAllTemplateList().finally(() => setLoading(false));
      const newList = Array.isArray(res) ? res : [];
      setTemplateList(newList);
    })();
  }, []);

  return {
    loading,
    list: templateList,
    loadAllTemplateList,
  };
};

type CollectionFormValues = {
  collectionName: string;
  description: string;
  coverImg: [
    {
      url: string;
      response?: AR_API.UploadFileResponse;
      [key: string]: any;
    },
  ];
  wxAppIdList: string[];
  templateId: string;
  collectionType: number;
  loadType: number;
  enableUserImage: boolean;
};
const useCollectionDetail = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<CollectionFormValues>();
  const wxJumpParamsRef = useRef<Record<string, string>>({});

  const loadCollectionDetail = useCallback((collectionUuid?: string) => {
    (async () => {
      if (!!collectionUuid) {
        setLoading(true);
        const res = await getCollectionByUuid(collectionUuid).finally(() => setLoading(false));
        if (res) {
          const _detail: CollectionFormValues = {
            collectionName: res.collectionName,
            coverImg: [
              {
                url: res.coverImgUrl,
              },
            ],
            description: res.description,
            wxAppIdList: (res.collectionAppList || []).map((item) => {
              const appId = item.appId;
              wxJumpParamsRef.current[appId] = item.wxJumpParam;
              return item.appId;
            }),
            templateId: "", // 暂时不加载模板ID
            collectionType: res.collectionType,
            loadType: res.loadType,
            enableUserImage: !!res.enableUserImage,
          };
          setDetail(_detail);
        } else {
          wxJumpParamsRef.current = {};
          setDetail(void 0);
        }
      } else {
        setLoading(false);
      }
    })();
  }, []);

  return {
    loading,
    detail,
    loadCollectionDetail,

    wxJumpParamsRef,
  };
};

const AddOrEditCollectionModal: React.FC<
  Omit<ModalFormProps, 'children'> & { collectionUuid?: string; onSuccess?: () => void }
> = (props) => {
  const { collectionUuid, onSuccess, ...modalFormProps } = props;

  const renderData = useMemo(() => {
    const isEdit = !!collectionUuid;
    return {
      isEdit,
      title: isEdit ? '编辑合集' : '新建合集',
    };
  }, [collectionUuid]);

  const { loading: loadingAppList, list: appList, loadAllAppList } = useAppList();
  const { loading: loadingTemplateList, list: templateList, loadAllTemplateList } = useTemplateList();
  const {
    loading: loadingCollectionDetail,
    detail: collectionDetail,
    loadCollectionDetail,

    wxJumpParamsRef,
  } = useCollectionDetail();

  return (
    <ModalForm
      title={renderData.title}
      width={520}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 18 }}
      initialValues={collectionDetail}
      modalProps={{
        loading: loadingCollectionDetail,
        destroyOnClose: true,
        maskClosable: false,
      }}
      onOpenChange={(open) => {
        if (open) {
          loadAllAppList();
          // loadAllTemplateList() // 暂时注释模板加载
          loadCollectionDetail(collectionUuid);
        }
      }}
      onFinish={async (values) => {
        const collectionName = values.collectionName || '';
        const description = values.description || '';
        const templateId = ''; // 暂时不使用模板ID
        const collectionType = values.collectionType || 0;
        const loadType = values.loadType || 0;
        const enableUserImage = values.enableUserImage ? 1 : 0;
        const coverImgUrl = values.coverImg?.[0]?.response?.url || values.coverImg?.[0]?.url || '';
        const wxAppInfoList = (values.wxAppIdList || []).map((appId: string) => {
          const wxJumpParam = wxJumpParamsRef.current[appId];
          return {
            appId,
            wxJumpParam,
          };
        });
        if (renderData.isEdit) {
          await editCollection({
            collectionUuid: collectionUuid!,
            collectionName,
            description,
            coverImgUrl,
            wxAppInfoList,
            enableUserImage,
            collectionType,
            loadType
          });
          message.success('编辑合集成功');
        } else {
          await addCollection({
            collectionName,
            description,
            coverImgUrl,
            wxAppInfoList,
            enableUserImage,
            collectionType,
            loadType
          });
          message.success('新建合集成功');
        }
        onSuccess?.();
        return true;
      }}
      {...modalFormProps}
    >
      <ProFormText
        name="collectionName"
        label="合集名称"
        placeholder="请输入合集名称"
        rules={[
          {
            required: true,
            message: '请输入合集名称',
          },
          {
            max: 20,
            message: '合集名称长度不超过20',
          },
        ]}
      />
      <ProFormUploadButton
        name="coverImg"
        label="合集logo"
        placeholder="请上传合集logo"
        max={1}
        required
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          accept: '.jpg,.jpeg,.png',
          customRequest: (params) =>
            customUploadRequest('/api/sys/file/uploadCollectionFile', params),
        }}
        extra="支持文件格式：.jpg,.jpeg,.png"
        rules={[
          {
            validator(rule, value) {
              if (value && Array.isArray(value) && value.length === 1) {
                const [file] = value;
                if (file.error) return Promise.reject(file.error.message);
                if (file.status === 'uploading') return Promise.reject('正在上传文件...');
                if (file.status === 'done' && !file.response)
                  return Promise.reject('上传文件失败，请重试！');
                return Promise.resolve();
              }
              return Promise.reject('请上传合集logo');
            },
          },
        ]}
      />
      <ProFormSelect
        name="wxAppIdList"
        label="小程序"
        placeholder="请选择关联小程序"
        mode="multiple"
        options={appList.map((item) => ({ value: item.appId, label: item.appName }))}
        fieldProps={{
          loading: loadingAppList,
        }}
        required
        rules={[
          {
            validator(rule, value) {
              if (Array.isArray(value) && value.length > 0) return Promise.resolve();
              return Promise.reject('请选择关联小程序');
            },
          },
        ]}
      />
      <ProFormSwitch
        name="enableUserImage"
        label="用户上传图片"
        tooltip="开启后，用户扫描此合集的二维码时可以上传自定义图片"
      />
      {/* 暂时注释掉合集类型选择 - 后端暂不支持 */}
      {/* <ProFormSelect
        name="collectionType"
        label="合集类型"
        placeholder="请选择合集类型"
        options={[
        {
          value: 0,
          label: '图像识别',
        },
        {
          value: 1,
          label: '平面识别',
        }]}
        required
        rules={[
          {
            required: true,
            message: '请选择合集类型',
          },
        ]}
      /> */}
      <ProFormSelect
        name="loadType"
        label="加载类型"
        placeholder="请选择加载类型"
        options={[
        {
          value: 0,
          label: '普通加载',
        },
        {
          value: 1,
          label: '分段加载',
        }]}
        required
        rules={[
          {
            required: true,
            message: '请选择加载类型',
          },
        ]}
      />
      {/* 暂时隐藏合集模板选择 */}
      {/* <ProFormSelect
        name="templateId"
        label="合集模板"
        placeholder="请选择关联合集模板"
        options={templateList.map((item) => ({ value: item.id, label: item.templateName }))}
        required
        rules={[
          {
            required: true,
            message: '请选择关联合集模板',
          },
        ]}
      /> */}
      <ProFormTextArea
        name="description"
        label="合集描述"
        fieldProps={{ showCount: true, maxLength: 140 }}
        rules={[
          {
            required: false,
            message: '请输入合集描述',
          },
          {
            max: 140,
            message: '合集描述长度不超过140',
          },
        ]}
      />
    </ModalForm>
  );
};

export default AddOrEditCollectionModal;
