import React, { useState, useEffect } from 'react';
import { Modal, Image } from 'antd';
import { ProTable } from '@ant-design/pro-components';

import { getCollectionByUuid } from '@/services/ar-platform/api';

import type { ModalProps } from 'antd';
import { flushSync } from 'react-dom';

const CollectionAppListModal: React.FC<
  Omit<ModalProps, 'children'> & { collectionUuid?: string }
> = (props) => {
  const { collectionUuid, ...modalProps } = props;
  const { open } = modalProps;
  const [loading, setLoading] = useState<boolean>(false);
  const [collectionName, setCollectionName] = useState<string>('');
  const [appList, setAppList] = useState<AR_API.AppListItem[]>([]);
  useEffect(() => {
    if (open && collectionUuid) {
      (async () => {
        setLoading(true);
        const res = await getCollectionByUuid(collectionUuid).finally(() => setLoading(false));
        const { collectionAppList, collectionName } = res || {};
        const _appList = collectionAppList || [];
        const _collectionName = collectionName || '';
        flushSync(() => {
          setAppList(_appList);
          setCollectionName(_collectionName);
        });
      })();
    }
  }, [open, collectionUuid]);
  return (
    <Modal title={collectionName} width={800} destroyOnClose footer={null} {...modalProps}>
      <ProTable<AR_API.AppListItem>
        rowKey="id"
        options={false}
        search={false}
        pagination={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
        loading={loading}
        dataSource={appList}
        columns={[
          {
            dataIndex: 'appName',
            title: '小程序名称',
          },
          {
            dataIndex: 'wxImgUrl',
            title: '小程序码',
            width: 100,
            renderText(val) {
              return (
                <div
                  onClick={() => {
                    Modal.info({
                      title: '使用微信扫码',
                      content: <Image src={val} width="100%" preview={false} />,
                    });
                  }}
                >
                  <Image src={val} height={80} preview={false} />
                </div>
              );
            },
          },
          {
            dataIndex: 'wxJumpParam',
            title: '跳转参数',
            copyable: true,
          },
          {
            dataIndex: 'wxNfcUrl',
            title: 'NfcUrl',
            copyable: true,
          },
        ]}
      />
    </Modal>
  );
};

export default CollectionAppListModal;
