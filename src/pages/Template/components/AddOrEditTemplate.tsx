import React, { useState, useMemo, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';

import type { ModalFormProps } from '@ant-design/pro-components';

import { customUploadRequest } from '@/utils';
import {
  getTemplateById,
  addTemplate,
  editTemplate,
} from '@/services/ar-platform/api';

type TemplateFormValues = {
  templateName: string;
  brandName: string;
  shareImg: [
    {
      url: string;
      response?: AR_API.UploadFileResponse;
      [key: string]: any;
    },
  ];
  bgImg: [
    {
      url: string;
      response?: AR_API.UploadFileResponse;
      [key: string]: any;
    },
  ];
};
const useTemplateDetail = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<TemplateFormValues>();
  const wxJumpParamsRef = useRef<Record<string, string>>({});

  const loadTemplateDetail = useCallback((id?: string) => {
    (async () => {
      if (!!id) {
        setLoading(true);
        const res = await getTemplateById(id).finally(() => setLoading(false));
        if (res) {
          const _detail: TemplateFormValues = {
            templateName: res.templateName,
            brandName: res.brandName,
            bgImg: [
              {
                url: res.bgImgUrl,
              },
            ],
            shareImg: [
              {
                url: res.shareImgUrl,
              },
            ],
          };
          setDetail(_detail);
        } else {
          wxJumpParamsRef.current = {};
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
    loadTemplateDetail,
    wxJumpParamsRef,
  };
};

const AddOrEditTemplateModal: React.FC<
  Omit<ModalFormProps, 'children'> & { id?: string; onSuccess?: () => void }
> = (props) => {
  const { id, onSuccess, ...modalFormProps } = props;

  const renderData = useMemo(() => {
    const isEdit = !!id;
    return {
      isEdit,
      title: isEdit ? '编辑模板' : '新建模板',
    };
  }, [id]);

  const {
    loading: loadingTemplateDetail,
    detail: templateDetail,
    loadTemplateDetail,
    wxJumpParamsRef,
  } = useTemplateDetail();

  return (
    <ModalForm
      title={renderData.title}
      width={520}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 18 }}
      initialValues={templateDetail}
      modalProps={{
        loading: loadingTemplateDetail,
        destroyOnClose: true,
        maskClosable: false,
      }}
      onOpenChange={(open) => {
        if (open) {
          loadTemplateDetail(id);
        }
      }}
      onFinish={async (values) => {
        const templateName = values.templateName || '';
        const brandName = values.brandName || '';
        const shareImgUrl = values.shareImg?.[0]?.response?.url || values.shareImg?.[0]?.url || '';
        const bgImgUrl = values.bgImg?.[0]?.response?.url || values.bgImg?.[0]?.url || '';
        if (renderData.isEdit) {
          await editTemplate({
            id: id!,
            templateName,
            brandName,
            bgImgUrl,
            shareImgUrl,
          });
          message.success('编辑模板成功');
        } else {
          await addTemplate({
            templateName,
            brandName,
            bgImgUrl,
            shareImgUrl,
          });
          message.success('新建模板成功');
        }
        onSuccess?.();
        return true;
      }}
      {...modalFormProps}
    >
      <ProFormText
        name="templateName"
        label="模板名称"
        placeholder="请输入模板名称"
        rules={[
          {
            required: true,
            message: '请输入模板名称',
          },
          {
            max: 20,
            message: '模板名称长度不超过20',
          },
        ]}
      />
      <ProFormText
        name="brandName"
        label="品牌名称"
        placeholder="请输入品牌名称"
        rules={[
          {
            required: true,
            message: '请输入品牌名称',
          },
          {
            max: 20,
            message: '品牌名称长度不超过20',
          },
        ]}
      />
      <ProFormUploadButton
        name="shareImg"
        label="分享图"
        placeholder="请上传分享图"
        max={1}
        required
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          accept: '.jpg,.jpeg,.png',
          customRequest: (params) =>
            customUploadRequest('/api/sys/file/uploadTemplateFile', params),
        }}
        extra="支持文件格式：.jpg,.jpeg,.png"
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
              return Promise.reject('请上传分享图');
            },
          },
        ]}
      />
      <ProFormUploadButton
        name="bgImg"
        label="背景图"
        placeholder="请上传小程序背景图"
        max={1}
        required
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          accept: '.jpg,.jpeg,.png',
          customRequest: (params) =>
            customUploadRequest('/api/sys/file/uploadTemplateFile', params),
        }}
        extra="支持文件格式：.jpg,.jpeg,.png"
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
              return Promise.reject('请上传小程序背景图');
            },
          },
        ]}
      />
    </ModalForm>
  );
};

export default AddOrEditTemplateModal;
