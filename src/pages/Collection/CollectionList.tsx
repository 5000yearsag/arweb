import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Image } from 'antd';
import React, { useRef, useState } from 'react';
import AddOrEditCollectionModal from './components/AddOrEditCollectionModal';
import CollectionAppListModal from './components/CollectionAppListModal';

import { getCollectionList } from '@/services/ar-platform/api';

const CollectionList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [appListModalProps, setAppListModalProps] = useState<{
    open: boolean;
    collectionUuid?: string;
  }>({
    open: false,
  });
  const [editCollectionUuid, setEditCollectionUuid] = useState<string>();

  return (
    <>
      <ProTable<AR_API.CollectionListItem>
        rowKey="id"
        actionRef={actionRef}
        search={false}
        request={async (params) => {
          const { current = 1, pageSize = 10, ...rest } = params;
          const res = await getCollectionList({
            ...rest,
            pageSize,
            pageNum: current,
          });
          const { list, total } = res || {};
          return {
            success: true,
            data: (list || []).map((item) => {
              const listItem = { ...(item || {}) };
              const { collectionAppList } = listItem;
              const appList = collectionAppList || [];
              return {
                ...item,
                appListNames: appList.map((item: any) => item.appName).join(', '),
              };
            }),
            total: total || 0,
          };
        }}
        columns={[
          {
            dataIndex: 'coverImgUrl',
            title: '合集logo',
            renderText(val) {
              return <Image src={val} height={80} />;
            },
          },
          {
            dataIndex: 'collectionName',
            title: '合集名称',
          },
          {
            dataIndex: 'appListNames',
            title: '小程序信息',
            renderText(val, record) {
              return !!val ? (
                <div>
                  <span>{val}</span>
                  <Button
                    style={{ marginLeft: 8 }}
                    type="link"
                    onClick={() => {
                      setAppListModalProps({
                        open: true,
                        collectionUuid: record.collectionUuid,
                      });
                    }}
                  >
                    详情
                  </Button>
                </div>
              ) : (
                ''
              );
            },
          },
          {
            dataIndex: 'sceneCount',
            title: '场景数量',
          },
          {
            dataIndex: 'templateName',
            title: '模板名称',
          },
          {
            dataIndex: 'collectionUuid',
            title: '操作',
            width: 260,
            renderText(val, record) {
              return (
                <div>
                  <Button
                    type="link"
                    onClick={() => {
                      history.push(`/scene/${val}?collectionName=${record.collectionName}`);
                    }}
                  >
                    场景管理
                  </Button>
                  <AddOrEditCollectionModal
                    collectionUuid={editCollectionUuid}
                    onSuccess={() => {
                      actionRef?.current?.reload();
                    }}
                    trigger={
                      <Button
                        type="link"
                        onClick={() => {
                          setEditCollectionUuid(val);
                        }}
                      >
                        编辑
                      </Button>
                    }
                  />
                  {/* <Button
                    type="link"
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: '删除合集',
                        content: `确认删除合集：${record.collectionName}?`,
                        async onOk() {
                          await deleteCollection(val);
                          message.success('删除合集成功');
                          actionRef?.current?.reload();
                        },
                      });
                    }}
                  >
                    删除
                  </Button> */}
                </div>
              );
            },
          },
        ]}
        toolBarRender={() => [
          <AddOrEditCollectionModal
            key="addCollection"
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
      <CollectionAppListModal
        {...appListModalProps}
        onCancel={() => setAppListModalProps({ open: false })}
      />
    </>
  );
};

export default CollectionList;
