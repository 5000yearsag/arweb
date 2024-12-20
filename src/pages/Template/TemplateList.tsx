import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Button, Image } from 'antd';
import React, { useRef, useState } from 'react';
import AddOrEditTemplate from './components/AddOrEditTemplate';

import { getTemplateList } from '@/services/ar-platform/api';

const TemplateList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editTemplateId, setEditTemplateId] = useState<string>();

  return (
    <>
      <ProTable<AR_API.TemplateListItem>
        rowKey="id"
        actionRef={actionRef}
        search={false}
        request={async (params) => {
          const { current = 1, pageSize = 10, ...rest } = params;
          const res = await getTemplateList({
            ...rest,
            pageSize,
            pageNum: current,
          });
          const { list, total } = res || {};
          return {
            success: true,
            data: (list || []).map((item) => {
              const listItem = { ...(item || {}) };
              return {
                ...item
              };
            }),
            total: total || 0,
          };
        }}
        columns={[
          {
            dataIndex: 'templateName',
            title: '模板名称',
          },
          {
            dataIndex: 'brandName',
            title: '品牌名称',
          },
          {
            dataIndex: 'shareImgUrl',
            title: '分享图',
            renderText(val) {
              return <Image src={val} height={80} />;
            },
          },
          {
            dataIndex: 'bgImgUrl',
            title: '背景图',
            renderText(val) {
              return <Image src={val} height={80} />;
            },
          },
          {
            dataIndex: 'id',
            title: '操作',
            width: 260,
            renderText(val, record) {
              return (
                <div>
                  <AddOrEditTemplate
                    id={editTemplateId}
                    onSuccess={() => {
                      actionRef?.current?.reload();
                    }}
                    trigger={
                      <Button
                        type="link"
                        onClick={() => {
                          setEditTemplateId(val);
                        }}
                      >
                        编辑
                      </Button>
                    }
                  />
                </div>
              );
            },
          },
        ]}
        toolBarRender={() => [
          <AddOrEditTemplate
            key="addTemplate"
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

export default TemplateList;
