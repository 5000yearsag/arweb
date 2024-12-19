import React from 'react';
import { PageContainer } from '@ant-design/pro-components';

import CollectionList from './CollectionList';
import AppList from './AppList';

enum EPAGE_TAB {
  COLLECTION_LIST = 'COLLECTION_LIST',
  APP_LIST = 'APP_LIST',
}

const CollectionManagement: React.FC = () => {
  return (
    <PageContainer
      tabList={[
        {
          key: EPAGE_TAB.COLLECTION_LIST,
          tab: '合集管理',
          children: <CollectionList />,
        },
        {
          key: EPAGE_TAB.APP_LIST,
          tab: '小程序管理',
          children: <AppList />,
        },
      ]}
      tabProps={{
        destroyInactiveTabPane: true,
      }}
    />
  );
};

export default CollectionManagement;
