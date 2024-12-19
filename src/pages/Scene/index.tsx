import React from 'react';
import { useParams } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import SceneList from './SceneList';

const SceneManagement: React.FC = () => {
  const { collectionUuid } = useParams();
  return (
    <PageContainer>
      {!!collectionUuid && <SceneList collectionUuid={collectionUuid} />}
    </PageContainer>
  );
};

export default SceneManagement;
