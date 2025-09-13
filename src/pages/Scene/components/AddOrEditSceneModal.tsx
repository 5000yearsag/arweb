import {
  ModalForm,
  ModalFormProps,
  ProForm,
  ProFormSwitch,
  ProFormText,
  ProFormUploadButton,
  ProFormList,
  ProFormGroup,
  ProCard
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
  userImageSpaceParamObj?: SpaceParamObj;
  tsbs?: boolean;
  
  extraJson: [
    {
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
      showMp3?: boolean;
    }
  ];
};

const defaultData = {
  arResource: [],
  arResourceDimension: '',
  arResourceFileName:'',
  arAudio: [],
  audioResourceFileName: '',
  spaceParamObj: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  userImageSpaceParamObj: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
  tsbs: false
}

const useSceneDetail = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<SceneFormValues>();
  const loadSceneDetail = useCallback((sceneUuid?: string) => {
    (async () => {
      if (!!sceneUuid) {
        setLoading(true);
        const res = await getSceneByUuid(sceneUuid).finally(() => setLoading(false));
        if (res) {
          const spaceParamData = parseSpaceParamStr(res.spaceParam);
          const spaceParamObj: SpaceParamObj = {
            position: spaceParamData.position || { x: 0, y: 0, z: 0 },
            rotation: spaceParamData.rotation || { x: 0, y: 0, z: 0 },
            scale: spaceParamData.scale || { x: 1, y: 1, z: 1 },
          };
          const userImageSpaceParamObj: SpaceParamObj = {
            position: spaceParamData.userImage?.position || { x: 0, y: 0, z: -1 },
            rotation: spaceParamData.userImage?.rotation || { x: 0, y: 0, z: 0 },
            scale: spaceParamData.userImage?.scale || { x: 1, y: 1, z: 1 },
          };
          const extraJsonOld = res.extraJson ? JSON.parse(res.extraJson) : void 0;
          const extraJsonNew = extraJsonOld ? extraJsonOld.map((item) => ({
            arResource: [
              {
                url: item.arResourceUrl,
                name: item.arResourceFileName,
              },
            ],
            arResourceDimension: item.arResourceDimension || '',
            arAudio: !item.audioResourceUrl
              ? []
              : [
                  {
                    url: item.audioResourceUrl,
                    name: item.audioResourceFileName || void 0,
                  },
                ],
            audioResourceFileName: item.audioResourceFileName || '',
            spaceParamObj: parseSpaceParamStr(item.spaceParam),
            tsbs: item.videoEffect === 'tsbs',
          })) : void 0;

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
            userImageSpaceParamObj,
            tsbs: res?.videoEffect === 'tsbs',
            extraJson: extraJsonNew ? extraJsonNew : void 0,
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
          step={0.1}
          addonBefore="X"
          value={x}
          onChange={(value) => {
            onChange?.('x', value);
          }}
        />
        <InputNumber
          precision={4}
          step={0.1}
          addonBefore="Y"
          value={y}
          onChange={(value) => {
            onChange?.('y', value);
          }}
        />
        <InputNumber
          precision={4}
          step={0.1}
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
  const renderData = useMemo(() => {
    const isEdit = !!sceneUuid;
    return {
      isEdit,
      title: isEdit ? '编辑场景' : '新建场景',
    };
  }, [sceneUuid]);
  const { loading, detail, loadSceneDetail } = useSceneDetail();
  return (
    <ModalForm
      title={renderData.title}
      width={800}
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
        const arResourceFileName = values.arResource?.[0]?.name || detail?.arResourceFileName;
        const audioResourceFileName = values.arAudio?.[0]?.name || detail?.audioResourceFileName;
        const arResourceDimension =
          values.arResource?.[0]?.response?.dimensions || detail?.arResourceDimension || '';

        const spaceParamObjInformValues = parseSpaceParamStr(
          values.spaceParamObj ? JSON.stringify(values.spaceParamObj) : void 0,
        );
        // 合并用户图片空间参数
        const userImageSpaceParam = parseSpaceParamStr(
          values.userImageSpaceParamObj ? JSON.stringify(values.userImageSpaceParamObj) : void 0,
        );
        const combinedSpaceParam = {
          ...spaceParamObjInformValues,
          userImage: userImageSpaceParam
        };
        const spaceParam = JSON.stringify(combinedSpaceParam);

        const videoEffect = values.tsbs ? 'tsbs' : void 0;

        const extraJsonNew = (values.extraJson || []).map((item) => {
          return {
            arResourceUrl: item.arResource?.[0]?.response?.url || item.arResource?.[0]?.url || '',
            arResourceFileName: item.arResource?.[0]?.name || item.arResourceFileName,
            arResourceDimension: item.arResource?.[0]?.response?.dimensions || item?.arResourceDimension || '',
            audioResourceUrl: item.arAudio?.[0]?.response?.url || item.arAudio?.[0]?.url || '',
            audioResourceFileName: item.arAudio?.[0]?.name || item.audioResourceFileName,
            spaceParam:JSON.stringify(parseSpaceParamStr(
              item.spaceParamObj ? JSON.stringify(item.spaceParamObj) : void 0
            )),
            videoEffect: item.tsbs ? 'tsbs' : void 0
          };
        });
        const extraJson = JSON.stringify(extraJsonNew);

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
            extraJson
          });
          message.success('编辑场景成功');
        } else {
          await addScene({
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
            extraJson
          });
          message.success('新建场景成功');
        }
        onSuccess?.();
        return true;
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
          accept: '.jpg,.jpeg,.png,.map',
          customRequest: (params) => customUploadRequest('/api/sys/file/uploadSceneFile', params),
        }}
        extra="支持文件格式：.jpg,.jpeg,.png,.map"
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
      <ProFormUploadButton
        name="arAudio"
        label="音频资源"
        placeholder="请上传场景音频资源（可选）"
        max={1}
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          accept: '.mp3',
          customRequest: (params) => customUploadRequest('/api/sys/file/uploadSceneFile', params),
        }}
        extra="支持文件格式：.mp3，可选项"
      />
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
      <ProForm.Item
        name="userImageSpaceParamObj"
        label="用户图片空间参数"
        tooltip="用户上传图片在AR场景中的位置、旋转和缩放参数"
        initialValue={{
          position: { x: 0, y: 0, z: -1 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        }}
      >
        <SpaceParam />
      </ProForm.Item>
      <ProFormList
        name="extraJson"
        label="资源"
        creatorButtonProps={{
          creatorButtonText: '添加资源',
        }}
        copyIconProps={false}
        itemRender={({ listDom, action }, { index, record }) => {
          return (
            <ProCard
              bordered
              style={{ marginBlockEnd: 6 }}
              title={`资源${index + 2}`}
              extra={action}
              bodyStyle={{ paddingBlockEnd: 0 }}
            >
              {listDom}
              <ProFormGroup>
                <ProFormUploadButton
                  isListField
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
                <ProFormUploadButton
                  isListField
                  name="arAudio"
                  label="音频资源"
                  placeholder="请上传场景音频资源（可选）"
                  max={1}
                  fieldProps={{
                    name: 'file',
                    listType: 'picture-card',
                    accept: '.mp3',
                    customRequest: (params) => customUploadRequest('/api/sys/file/uploadSceneFile', params),
                  }}
                  extra="支持文件格式：.mp3，可选项"
                />
              </ProFormGroup>
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
            </ProCard>
          );
        }}
        creatorRecord={defaultData}
      >
        
      </ProFormList>
    </ModalForm>
  );
};

export default AddOrEditSceneModal;
