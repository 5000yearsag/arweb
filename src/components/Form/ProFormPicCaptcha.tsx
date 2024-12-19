import React, { useCallback, useEffect, useState } from 'react';
import { Image, Input } from 'antd';
import { createStyles } from 'antd-style';
import { LoadingOutlined } from '@ant-design/icons';
import { ProForm } from '@ant-design/pro-components';
import { getCaptchaForLogin } from '@/services/ar-platform/api';

import { v4 as uuidv4 } from 'uuid';

import type { ImageProps } from 'antd';
import type { ProFormItemProps } from '@ant-design/pro-components';

const useStyles = createStyles(({ token }) => {
  return {
    codeInputWrap: {
      display: 'flex',
      gap: 6,
    },
    captchaImageWrap: {
      height: '100%',
      cursor: 'pointer',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      overflow: 'hidden',
      flexShrink: 0,
    },
  };
});

type CaptchaPictureProps = ImageProps & {
  onChange?: (rs?: string) => void;
};
const CaptchaPicture = (props: CaptchaPictureProps) => {
  const { styles } = useStyles();
  const { onChange, ...rest } = props;
  const defaultProps: ImageProps = {
    preview: false,
    width: 152,
    height: 38,
    fallback:
      'data:image/png;base64,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',
  };

  const [pictureSrc, setPictureSrc] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const reloadPicture = useCallback(() => {
    const uuid = uuidv4();
    setLoading(true);
    getCaptchaForLogin(uuid)
      .then((data) => {
        let imgBase64Str;
        let randomStr;
        if (!!data) {
          imgBase64Str = `data:image;base64,${data}`;
          randomStr = uuid;
        }
        setPictureSrc(imgBase64Str);
        onChange?.(randomStr);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    reloadPicture();
  }, []);

  const imageProps = {
    src: pictureSrc,
    ...defaultProps,
    ...rest,
  };
  return (
    <div
      className={styles.captchaImageWrap}
      onClick={() => {
        if (loading) return;
        reloadPicture();
      }}
    >
      {loading ? (
        <div
          style={{
            width: imageProps.width,
            height: imageProps.height,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LoadingOutlined />
        </div>
      ) : (
        <Image {...imageProps} />
      )}
    </div>
  );
};

type PictureCaptchaFieldValue = {
  captcha?: string;
  randomStr?: string;
};
type ProFormPictureCaptchaFieldProps = {
  value?: PictureCaptchaFieldValue;
  onChange?: (val: PictureCaptchaFieldValue) => void;
  fieldProps?: ProFormItemProps['fieldProps'];
  pictureProps?: CaptchaPictureProps;
};
const ProFormPictureCaptchaField = (props: ProFormPictureCaptchaFieldProps) => {
  const { styles } = useStyles();
  const { value, onChange, fieldProps, pictureProps } = props;
  return (
    <div className={styles.codeInputWrap}>
      <Input
        value={value?.captcha}
        onChange={(e) => {
          onChange?.({
            ...value,
            captcha: e.target.value,
          });
        }}
        {...(fieldProps || {})}
      />
      <CaptchaPicture
        onChange={(rs) => {
          if (!!rs && typeof rs === 'string') {
            onChange?.({
              ...value,
              randomStr: rs,
            });
          }
        }}
        {...pictureProps}
      />
    </div>
  );
};

const ProFormPictureCaptcha = (
  props: Omit<ProFormItemProps, 'children'> & { pictureProps?: CaptchaPictureProps },
) => {
  const { placeholder, fieldProps, pictureProps, ...rest } = props;
  return (
    <ProForm.Item {...rest}>
      <ProFormPictureCaptchaField
        fieldProps={{
          placeholder,
          ...(fieldProps || {}),
        }}
        pictureProps={pictureProps}
      />
    </ProForm.Item>
  );
};

export default ProFormPictureCaptcha;
