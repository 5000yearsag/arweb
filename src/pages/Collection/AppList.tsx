import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import AddOrEditAppModal from './components/AddOrEditAppModal';

import { getAllAppList } from '@/services/ar-platform/api';

const AppList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any[]>([]);

  const [editAppProps, setEditAppProps] = useState<{
    id?: string;
    appId?: string;
  }>({});

  const reloadAppList = useCallback(() => {
    (async () => {
      setLoading(true);
      const res = await getAllAppList().finally(() => setLoading(false));
      const _list = Array.isArray(res) ? res : [];
      setList(_list);
    })();
  }, []);

  useEffect(() => {
    reloadAppList();
  }, []);
  return (
    <>
      <ProTable<AR_API.AppListItem>
        rowKey="id"
        search={false}
        options={false}
        loading={loading}
        dataSource={list}
        columns={[
          {
            dataIndex: 'appName',
            title: '名称',
          },
          {
            dataIndex: 'appId',
            title: 'AppID',
          },
          {
            dataIndex: 'appSecret',
            title: 'AppSecret',
            valueType: 'password',
            width: 500,
          },
          {
            dataIndex: 'id',
            title: '操作',
            width: 200,
            renderText(val, record) {
              return (
                <div>
                  <AddOrEditAppModal
                    {...editAppProps}
                    onSuccess={reloadAppList}
                    trigger={
                      <Button
                        type="link"
                        onClick={() => {
                          setEditAppProps({
                            id: val,
                            appId: record.appId,
                          });
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
                        title: '删除小程序',
                        content: `确认删除小程序：${record.appName}`,
                        async onOk() {
                          await deleteApp({ id: val, appId: record.appId });
                          message.success('删除小程序成功');
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
          <AddOrEditAppModal
            key="addApp"
            onSuccess={reloadAppList}
            trigger={
              <Button type="primary" icon={<PlusOutlined />}>
                新建
              </Button>
            }
          />,
          <div
            key="reloadAppList"
            style={{
              cursor: 'pointer',
              fontSize: 16,
              height: 32,
              width: 16,
              margin: '0 4px',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => {
              reloadAppList();
            }}
          >
            <ReloadOutlined />
          </div>,
        ]}
      />
    </>
  );
};

export default AppList;
