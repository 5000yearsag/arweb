import React, { useMemo, useState, useCallback } from 'react';
import { message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { addApp, editApp, getAppByAppId } from '@/services/ar-platform/api';

import type { ModalFormProps } from '@ant-design/pro-components';

const useAppDetail = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<AR_API.AddAppBody>();
  const loadAppDetail = useCallback((id?: string, appId?: string) => {
    (async () => {
      if (!!id && !!appId) {
        setLoading(true);
        const res = await getAppByAppId({ id, appId }).finally(() => setLoading(false));
        if (res) {
          setDetail(res);
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
    loadAppDetail,
  };
};

const AddOrEditAppModal: React.FC<
  Omit<ModalFormProps, 'children'> & { id?: string; appId?: string; onSuccess?: () => void }
> = (props) => {
  const { id, appId, onSuccess, ...modalFormProps } = props;
  const renderData = useMemo(() => {
    const isEdit = !!id && !!appId;
    return {
      isEdit,
      title: isEdit ? '编辑小程序' : '新建小程序',
    };
  }, [id, appId]);

  const { loading, detail, loadAppDetail } = useAppDetail();

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
          loadAppDetail(id, appId);
        }
      }}
      onFinish={async (values) => {
        const formValues: AR_API.AddAppBody = {
          appId: values.appId || '',
          appName: values.appName || '',
          appSecret: values.appSecret || '',
          wxJumpParam: values.wxJumpParam || '',
        };
        if (renderData.isEdit) {
          await editApp({
            id: id!,
            ...formValues,
          });
          message.success('编辑小程序成功');
        } else {
          await addApp(formValues);
          message.success('新增小程序成功');
        }
        onSuccess?.();
        return true;
      }}
      {...modalFormProps}
    >
      <ProFormText
        name="appName"
        label="小程序名称"
        placeholder="请输入小程序名称"
        rules={[
          {
            required: true,
            message: '请输入小程序名称',
          },
          {
            max: 20,
            message: '小程序长度不超过20',
          },
        ]}
      />
      <ProFormText
        name="appId"
        label="AppID"
        placeholder="请输入AppID"
        rules={[
          {
            required: true,
            message: '请输入AppID',
          },
        ]}
      />
      <ProFormText
        name="appSecret"
        label="AppSecret"
        placeholder="请输入AppSecret"
        rules={[
          {
            required: true,
            message: '请输入AppSecret',
          },
        ]}
      />
      <ProFormTextArea name="wxJumpParam" label="跳转参数" placeholder="请输入跳转参数" />
    </ModalForm>
  );
};

export default AddOrEditAppModal;
