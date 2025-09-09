import { DoubleLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { useSearchParams } from '@umijs/max';
import { Button, Image, Switch, SwitchProps, Modal, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import AddOrEditSceneModal from './components/AddOrEditSceneModal';

import ModelPreviewImg from '@/assets/images/model_preview.jpg';
import PlayerImg from '@/assets/images/player.png';
import { BigPlayButton, Player } from 'video-react';

import { getCollectionSecenList, triggerSwitchScene, deleteScene } from '@/services/ar-platform/api';

const SceneSwitch = (
  props: SwitchProps & {
    id: string;
    sceneUuid: string;
    status: 0 | 1;
    onSuccess?: () => void;
  },
) => {
  const { id, sceneUuid, status, onSuccess } = props;
  const [loading, setLoading] = useState(false);
  const triggerSwitchSceneAction = useCallback((body: AR_API.SceneSwitchBody) => {
    (async () => {
      setLoading(true);
      await triggerSwitchScene(body).finally(() => setLoading(false));
      onSuccess?.();
    })();
  }, []);
  return (
    <Switch
      loading={loading}
      value={status === 1}
      onChange={(val) => {
        if (!!id && !!sceneUuid) {
          const nextStatus = val ? 1 : 0;
          triggerSwitchSceneAction({
            // id,
            sceneUuid,
            status: nextStatus,
          });
        }
      }}
      {...props}
    />
  );
};

const SceneList: React.FC<{ collectionUuid: string }> = (props) => {
  const [searchParams] = useSearchParams();

  const { collectionUuid } = props;

  const actionRef = useRef<ActionType>();

  const [editSceneProps, setEditSceneProps] = useState<{
    id?: string;
    sceneUuid?: string;
  }>({});

  return (
    <>
      <ProTable<AR_API.SceneListItem>
        rowKey="id"
        actionRef={actionRef}
        search={false}
        headerTitle={
          <div>
            <Button
              type="primary"
              ghost
              size="small"
              icon={<DoubleLeftOutlined />}
              onClick={() => {
                history.back();
              }}
              style={{ marginRight: 16 }}
            >
              返回
            </Button>
            <span>{`当前合集：${searchParams.get('collectionName') || ''}`}</span>
          </div>
        }
        request={async (params) => {
          if (!!collectionUuid) {
            const { current = 1, pageSize = 10, ...rest } = params;
            const res = await getCollectionSecenList({
              ...rest,
              collectionUuid,
              pageSize,
              pageNum: current,
            });
            const { list, total } = res || {};
            return {
              success: true,
              data: list || [],
              total: total || 0,
            };
          }
          return {
            success: true,
            data: [],
            total: 0,
          };
        }}
        columns={[
          {
            dataIndex: 'sceneImgUrl',
            title: '识别图',
            renderText(val) {
              return <Image src={val} height={80} />;
            },
          },
          {
            dataIndex: 'sceneName',
            title: '名称',
          },
          {
            dataIndex: 'arResourceUrl',
            title: 'AR资源',
            renderText(text, record) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Image
                    src={record.arResourceType === 'video' ? PlayerImg : ModelPreviewImg}
                    width={record.arResourceType === 'video' ? 120 : 60}
                    height={60}
                    preview={
                      record.arResourceType === 'video'
                        ? {
                            destroyOnClose: true,
                            toolbarRender: () => null,
                            imageRender: () => {
                              return (
                                <Player src={text} height={660} fluid={false}>
                                  <BigPlayButton position="center" />
                                </Player>
                              );
                            },
                          }
                        : false
                    }
                  />
                  {record?.arResourceFileName || ''}
                </div>
              );
            },
          },
          {
            dataIndex: 'spaceParam',
            title: '空间参数',
            renderText(text) {
              let spaceParamObj: any = {};
              try {
                spaceParamObj = JSON.parse(text);
              } catch (e) {}
              const { position, rotation, scale } = spaceParamObj || {};
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div>
                    位置：{position?.x}, {position?.y}, {position?.z}
                  </div>
                  <div>
                    旋转：{rotation?.x}, {rotation?.y}, {rotation?.z}
                  </div>
                  <div>
                    缩放：{scale?.x}, {scale?.y}, {scale?.z}
                  </div>
                </div>
              );
            },
          },
          {
            dataIndex: 'id',
            title: '操作',
            width: 200,
            renderText(val, record) {
              return (
                <div>
                  <SceneSwitch
                    id={val}
                    sceneUuid={record.sceneUuid}
                    status={record.status}
                    onSuccess={() => {
                      actionRef?.current?.reload();
                    }}
                  />
                  <AddOrEditSceneModal
                    {...editSceneProps}
                    collectionUuid={collectionUuid}
                    onSuccess={() => {
                      actionRef?.current?.reload();
                    }}
                    trigger={
                      <Button
                        type="link"
                        onClick={() => {
                          setEditSceneProps({
                            id: val,
                            sceneUuid: record.sceneUuid,
                          });
                        }}
                      >
                        编辑
                      </Button>
                    }
                  />
                  <Button
                    type="link"
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: '删除场景',
                        content: `确认删除场景：${record.sceneName}`,
                        async onOk() {
                          await deleteScene(record.sceneUuid);
                          message.success('删除场景成功');
                          actionRef?.current?.reload();
                        },
                      });
                    }}
                  >
                    删除
                  </Button>
                </div>
              );
            },
          },
        ]}
        toolBarRender={() => [
          <AddOrEditSceneModal
            key="addScene"
            collectionUuid={collectionUuid}
            onSuccess={() => {
              actionRef?.current?.reload();
            }}
            trigger={
              <Button type="primary" icon={<PlusOutlined />}>
                新建
              </Button>
            }
          />,
        ]}
      />
    </>
  );
};

export default SceneList;
