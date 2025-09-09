// import { Footer } from '@/components';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { FormattedMessage, history, useIntl, Helmet, useModel /*, SelectLang */ } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import { LockOutlined, PictureOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import ProFormPictureCaptcha from '@/components/Form/ProFormPicCaptcha';

import md5 from 'md5';

import { sysLogin } from '@/services/ar-platform/api';
import { arPlatformServiceConfigInstance } from '@/requestErrorConfig';

import Settings from '../../../../config/defaultSettings';

type LoginFormValues = {
  username: string;
  password: string;
  sysCode?: {
    captcha: string;
    randomStr: string;
  };
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  return null;
  /*
  const { styles } = useStyles();
  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
  */
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginError, setUserLoginError] = useState<string>();
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: LoginFormValues) => {
    const defaultLoginFailureMessage = intl.formatMessage({
      id: 'pages.login.failure',
      defaultMessage: '登录失败，请重试！',
    });
    try {
      // 登录
      const loginParams: any = {
        username: values.username,
        password: md5(values.password),
      };
      
      // 需要验证码（仅在非开发环境）
      if (process.env.NODE_ENV !== 'development' && values.sysCode) {
        loginParams.captcha = values.sysCode.captcha;
        loginParams.randomStr = values.sysCode.randomStr;
      }
      
      const data = await sysLogin(loginParams).catch((e) => {
        const errorMessage = e.message;
        if (!!errorMessage) setUserLoginError(errorMessage);
        throw e;
      });
      if (data && data.token) {
        arPlatformServiceConfigInstance.token = data.token;
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      message.error(defaultLoginFailureMessage);
      // 如果失败去设置用户错误信息
    } catch (error) {
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          // logo={<img alt="logo" src="/logo.svg" />}
          // title="Ant Design"
          // subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as LoginFormValues);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
              },
            ]}
          />

          {!!userLoginError && <LoginMessage content={userLoginError} />}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              {/* 显示验证码 - 仅在非开发环境显示 */}
              {process.env.NODE_ENV !== 'development' && (
                <ProFormPictureCaptcha
                  name="sysCode"
                  fieldProps={{
                    size: 'large',
                    prefix: <PictureOutlined />,
                  }}
                  placeholder="图形验证码"
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
              )}
            </>
          )}
        </LoginForm>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Login;
