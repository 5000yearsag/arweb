#!/usr/bin/env python3
import subprocess
import pexpect
import sys
import os

def ssh_connect_and_deploy():
    try:
        print("🚀 开始SSH连接和部署...")
        
        # SSH连接命令
        ssh_cmd = "ssh -o StrictHostKeyChecking=no root@47.116.172.28"
        
        # 使用pexpect进行交互式SSH
        child = pexpect.spawn(ssh_cmd)
        child.timeout = 30
        
        # 等待密码提示
        index = child.expect(['password:', 'Password:', pexpect.EOF, pexpect.TIMEOUT])
        
        if index == 0 or index == 1:
            print("✅ 收到密码提示，正在输入密码...")
            child.sendline('Siyue030@')
            
            # 等待登录成功
            index = child.expect(['#', '$', 'Permission denied', pexpect.EOF, pexpect.TIMEOUT])
            
            if index == 0 or index == 1:
                print("✅ SSH登录成功!")
                
                # 执行部署命令
                child.sendline('pwd && whoami')
                child.expect(['#', '$'])
                print("当前目录和用户:", child.before.decode())
                
                child.sendline('exit')
                child.close()
                return True
            else:
                print("❌ 登录失败")
                return False
        else:
            print("❌ 未收到密码提示")
            return False
            
    except Exception as e:
        print(f"❌ SSH连接错误: {e}")
        return False

if __name__ == "__main__":
    success = ssh_connect_and_deploy()
    sys.exit(0 if success else 1)