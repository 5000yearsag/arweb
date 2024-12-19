import {
  ModalForm,
  ModalFormProps,
  ProForm,
  ProFormSwitch,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { InputNumber, Space, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { addScene, editScene, getSceneByUuid } from '@/services/ar-platform/api';
import { customUploadRequest, parseSpaceParamStr } from '@/utils';

type SpaceParamMeta = {
  x?: number;
  y?: number;
  z?: number;
};
type SpaceParamObj = {
  position: SpaceParamMeta;
  rotation: SpaceParamMeta;
  scale: SpaceParamMeta;
};
type SceneFormValues = {
  id?: string;
  sceneUuid?: string;
  collectionUuid: string;
  sceneName: string;
  sceneImg: [
    {
      url: string;
      response?: AR_API.UploadFileResponse;
      [key: string]: any;
    },
  ];
  arResource: [
    {
      url: string;
      response?: AR_API.UploadFileResponse;
      [key: string]: any;
    },
  ];
  arResourceDimension: string;
  arResourceFileName?: string;
  arAudio: [
    {
      url: string;
      response?: AR_API.UploadFileResponse;
      [key: string]: any;
    },
  ];
  audioResourceFileName?: string;
  spaceParamObj?: SpaceParamObj;
  tsbs?: boolean;
};

const useSceneDetail = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<SceneFormValues>();
  const loadSceneDetail = useCallback((sceneUuid?: string) => {
    (async () => {
      if (!!sceneUuid) {
        setLoading(true);
        const res = await getSceneByUuid(sceneUuid).finally(() => setLoading(false));
        if (res) {
          const spaceParamObj: SpaceParamObj = parseSpaceParamStr(res.spaceParam);
          setDetail({
            id: res.id,
            sceneUuid: res.sceneUuid,
            collectionUuid: res.collectionUuid,
            sceneName: res.sceneName,
            sceneImg: [
              {
                url: res.sceneImgUrl,
              },
            ],
            arResource: [
              {
                url: res.arResourceUrl,
                name: res.arResourceFileName || void 0,
              },
            ],
            arResourceDimension: res.arResourceDimension || '',
            arAudio: !res.audioResourceUrl
              ? []
              : [
                  {
                    url: res.audioResourceUrl,
                    name: res.audioResourceFileName || void 0,
                  },
                ],
            spaceParamObj,
            tsbs: res?.videoEffect === 'tsbs',
          });
        } else {
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
    loadSceneDetail,
  };
};

const SpaceParamField = (props: {
  label?: string;
  x?: number;
  y?: number;
  z?: number;
  onChange?: (name: 'x' | 'y' | 'z', val?: number | null) => void;
}) => {
  const { label, x, y, z, onChange } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ flexShrink: 0 }}>{label || ''}</span>
      <Space.Compact>
        <InputNumber
          precision={4}
          addonBefore="X"
          value={x}
          onChange={(value) => {
            onChange?.('x', value);
          }}
        />
        <InputNumber
          precision={4}
          addonBefore="Y"
          value={y}
          onChange={(value) => {
            onChange?.('y', value);
          }}
        />
        <InputNumber
          precision={4}
          addonBefore="Z"
          value={z}
          onChange={(value) => {
            onChange?.('z', value);
          }}
        />
      </Space.Compact>
    </div>
  );
};

const SpaceParam = (props: { value?: SpaceParamObj; onChange?: (val: SpaceParamObj) => void }) => {
  const { value, onChange } = props;
  const { position, rotation, scale } = value || {};
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <SpaceParamField
        {...position}
        label="位置"
        onChange={(name, val) => {
          onChange?.({
            rotation: rotation || {},
            scale: scale || {},
            position: {
              ...(position || {}),
              [name]: val,
            },
          });
        }}
      />
      <SpaceParamField
        {...rotation}
        label="旋转"
        onChange={(name, val) => {
          onChange?.({
            position: position || {},
            scale: scale || {},
            rotation: {
              ...(rotation || {}),
              [name]: val,
            },
          });
        }}
      />
      <SpaceParamField
        {...scale}
        label="缩放"
        onChange={(name, val) => {
          onChange?.({
            position: position || {},
            rotation: rotation || {},
            scale: {
              ...(scale || {}),
              [name]: val,
            },
          });
        }}
      />
    </div>
  );
};

const AddOrEditSceneModal: React.FC<
  Omit<ModalFormProps, 'children'> & {
    collectionUuid: string;
    id?: string;
    sceneUuid?: string;
    onSuccess?: () => void;
  }
> = (props) => {
  const { collectionUuid, id, sceneUuid, onSuccess, ...modalFormProps } = props;
  const [showMp3, setShowMp3] = useState<boolean>(false);
  const renderData = useMemo(() => {
    const isEdit = !!sceneUuid;
    return {
      isEdit,
      title: isEdit ? '编辑场景' : '新建场景',
    };
  }, [sceneUuid]);
  const { loading, detail, loadSceneDetail } = useSceneDetail();
  useEffect(() => {
    if (detail?.arResource.length && detail?.arResource[0].url.indexOf('.glb') !== -1) {
      setShowMp3(true);
    }
  }, [detail]);
  return (
    <ModalForm
      title={renderData.title}
      width={520}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 18 }}
      initialValues={detail}
      modalProps={{
        loading,
        destroyOnClose: true,
        maskClosable: false,
      }}
      onOpenChange={(open) => {
        if (open) {
          loadSceneDetail(sceneUuid);
        }
      }}
      onFinish={async (values) => {
        const sceneName = values.sceneName || '';
        const sceneImgUrl = values.sceneImg?.[0]?.response?.url || values?.sceneImg?.[0]?.url || '';
        const arResourceUrl =
          values.arResource?.[0]?.response?.url || values.arResource?.[0]?.url || '';
        const audioResourceUrl =
          values.arAudio?.[0]?.response?.url || values.arAudio?.[0]?.url || '';
        const arResourceFileName = detail?.arResourceFileName;
        const audioResourceFileName = detail?.audioResourceFileName;
        const arResourceDimension =
          values.arResource?.[0]?.response?.dimensions || detail?.arResourceDimension || '';

        const spaceParamObjInformValues = parseSpaceParamStr(
          values.spaceParamObj ? JSON.stringify(values.spaceParamObj) : void 0,
        );
        const spaceParam = JSON.stringify(spaceParamObjInformValues);

        const videoEffect = values.tsbs ? 'tsbs' : void 0;

        if (renderData.isEdit) {
          await editScene({
            id: id!,
            sceneUuid: sceneUuid!,
            collectionUuid,
            sceneName,
            sceneImgUrl,
            arResourceUrl,
            audioResourceUrl,
            arResourceFileName,
            audioResourceFileName,
            arResourceDimension,
            spaceParam,
            videoEffect,
          });
          message.success('编辑场景成功');
        } else {
          await addScene({
            collectionUuid,
            sceneName,
            sceneImgUrl,
            arResourceUrl,
            audioResourceUrl,
            arResourceDimension,
            spaceParam,
            videoEffect,
          });
          message.success('新建场景成功');
        }
        setShowMp3(false);
        onSuccess?.();
        return true;
      }}
      onValuesChange={(v) => {
        if (v.arResource) {
          if (v.arResource.length && v.arResource[0]?.name.indexOf('.glb') !== -1) {
            setShowMp3(true);
          } else {
            setShowMp3(false);
          }
        }
      }}
      {...modalFormProps}
    >
      <ProFormUploadButton
        name="sceneImg"
        label="识别图"
        placeholder="请上传场景识别图"
        max={1}
        required
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          accept: '.jpg,.jpeg,.png',
          customRequest: (params) => customUploadRequest('/api/sys/file/uploadSceneFile', params),
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
              return Promise.reject('请上传场景识别图');
            },
          },
        ]}
      />
      <ProFormText
        name="sceneName"
        label="场景名称"
        placeholder="请输入场景名称"
        rules={[
          {
            required: true,
            message: '请输入场景名称',
          },
          {
            max: 20,
            message: '场景名称长度不超过20',
          },
        ]}
      />
      <ProFormUploadButton
        name="arResource"
        label="AR资源"
        placeholder="请上传场景AR资源"
        max={1}
        required
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          accept: '.avi,.mov,.mp4,.glb',
          customRequest: (params) => customUploadRequest('/api/sys/file/uploadSceneFile', params),
        }}
        extra="支持文件格式：.avi,.mov,.mp4,.glb"
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
              return Promise.reject('请上传场景AR资源');
            },
          },
        ]}
      />
      {showMp3 ? (
        <ProFormUploadButton
          name="arAudio"
          label="音频资源"
          placeholder="请上传场景音频资源"
          max={1}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
            accept: '.mp3',
            customRequest: (params) => customUploadRequest('/api/sys/file/uploadSceneFile', params),
          }}
          extra="支持文件格式：.mp3"
        />
      ) : null}
      <ProForm.Item name="tsbs" label="透明视频">
        <ProFormSwitch />
      </ProForm.Item>
      <ProForm.Item
        name="spaceParamObj"
        label="空间参数"
        initialValue={{
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        }}
      >
        <SpaceParam />
      </ProForm.Item>
    </ModalForm>
  );
};

export default AddOrEditSceneModal;
