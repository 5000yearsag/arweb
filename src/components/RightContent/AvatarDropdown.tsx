import React, { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { history, useModel } from '@umijs/max';
import { message, Spin } from 'antd';
import { createStyles } from 'antd-style';
import {
  LockOutlined,
  LogoutOutlined /*, SettingOutlined, UserOutlined  */,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';

import ProFormPictureCaptcha from '../Form/ProFormPicCaptcha';

import HeaderDropdown from '../HeaderDropdown';

import md5 from 'md5';
import { stringify } from 'querystring';
import { arPlatformServiceConfigInstance } from '@/requestErrorConfig';
import { sysLogout, resetUserPassword } from '@/services/ar-platform/api';

import type { ModalFormProps } from '@ant-design/pro-components';
import type { MenuInfo } from 'rc-menu/lib/interface';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.name ?? currentUser?.username}</span>;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async (history: any) => {
  await sysLogout()
    .catch((e) => {
      if (e?.info?.returnCode === 20080) return;
      throw e;
    })
    .finally(() => (arPlatformServiceConfigInstance.token = ''));

  const { search, pathname } = window.location;
  const urlParams = new URL(window.location.href).searchParams;
  /** 此方法会跳转到 redirect 参数所在的位置 */
  const redirect = urlParams.get('redirect');
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};

type ResetPasswordModalFormValues = {
  oldPassword: string;
  newPassword: string;
  sysCode: {
    captcha: string;
    randomStr: string;
  };
};
type ResetPasswordModalFormProps = ModalFormProps<ResetPasswordModalFormValues>;
const ResetPasswordModalForm = (props: ResetPasswordModalFormProps & { logout?: () => void }) => {
  const { logout, ...rest } = props;
  return (
    <ModalForm<ResetPasswordModalFormValues>
      title="修改密码"
      width={360}
      modalProps={{ destroyOnClose: true }}
      onFinish={async (values) => {
        await resetUserPassword({
          oldPassword: md5(values.oldPassword),
          newPassword: md5(values.newPassword),
          captcha: values.sysCode.captcha,
          randomStr: values.sysCode.randomStr,
        });
        message.success('修改密码成功！请重新登录', () => {
          logout?.();
        });
      }}
      {...rest}
    >
      <ProFormText.Password
        name="oldPassword"
        label="原密码"
        placeholder="请输入原密码"
        rules={[
          {
            required: true,
            message: '请输入原密码',
          },
        ]}
      />
      <ProFormText.Password
        name="newPassword"
        label="新密码"
        placeholder="请输入新密码"
        rules={[
          {
            required: true,
            message: '请输入新密码',
          },
        ]}
      />
      <ProFormText.Password
        name="confirmPassword"
        label="确认密码"
        placeholder="请输入确认密码"
        dependencies={['newPassword']}
        rules={[
          {
            required: true,
            message: '请输入确认密码',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('新密码与确认密码不一致'));
            },
          }),
        ]}
      />
      <ProFormPictureCaptcha
        name="sysCode"
        label="图形验证码"
        placeholder="请输入图形验证码"
        pictureProps={{
          width: 120,
          height: 30,
        }}
        rules={[
          {
            required: true,
            message: '请输入图形验证码',
          },
          {
            validator(_, value) {
              if (value) {
                if (value.captcha && value.randomStr) return Promise.resolve();
                return Promise.reject('请输入图形验证码');
              }
              return Promise.resolve();
            },
          },
        ]}
      />
    </ModalForm>
  );
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  const { styles } = useStyles();

  const [resetPasswordModalFormOpen, setResetPasswordModalFormOpen] = useState<boolean>(false);

  const { initialState, setInitialState } = useModel('@@initialState');

  const logout = useCallback(() => {
    flushSync(() => {
      setInitialState((s) => ({ ...s, currentUser: undefined }));
    });
    loginOut(history);
  }, []);

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        logout();
        return;
      }
      if (key === 'resetPassword') {
        setResetPasswordModalFormOpen(true);
      }
      // history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.username) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          /*
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          */
          {
            key: 'resetPassword',
            icon: <LockOutlined />,
            label: '修改密码',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <>
      <HeaderDropdown
        menu={{
          selectedKeys: [],
          onClick: onMenuClick,
          items: menuItems,
        }}
      >
        {children}
      </HeaderDropdown>
      <ResetPasswordModalForm
        open={resetPasswordModalFormOpen}
        onOpenChange={setResetPasswordModalFormOpen}
        logout={logout}
      />
    </>
  );
};
