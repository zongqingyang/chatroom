package cn.edu.ncu.bootwebsocketmybatis.dao;

import cn.edu.ncu.bootwebsocketmybatis.entity.UserInfo;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @package: cn.edu.ncu.bootwebsocketmybatis.dao
 * @project: boot-websocket-mybatis
 */
@Repository
public interface UserInfoDao {

    List<UserInfo> findAll();

    UserInfo findByUserId(String id);

    int addUserInfo(UserInfo userInfo);

    int updateUserInfo(UserInfo userInfo);

    int updateUserInfoNoImage(UserInfo userInfo);
}
