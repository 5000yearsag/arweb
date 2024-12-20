import React from 'react';
import { PageContainer } from '@ant-design/pro-components';

import TemplateList from './TemplateList';

enum EPAGE_TAB {
  COLLECTION_LIST = 'COLLECTION_LIST',
}

const TemplateManagement: React.FC = () => {
  return (
    <PageContainer
      tabList={[
        {
          key: EPAGE_TAB.COLLECTION_LIST,
          tab: '模板管理',
          children: <TemplateList />,
        }
      ]}
      tabProps={{
        destroyInactiveTabPane: true,
      }}
    />
  );
};

export default TemplateManagement;
