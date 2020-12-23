package cn.edu.ncu.bootwebsocketmybatis.service;

import cn.edu.ncu.bootwebsocketmybatis.entity.Group;

import java.util.List;

/**
 * @package: cn.edu.ncu.bootwebsocketmybatis.service
 * @project: boot-websocket-mybatis
 */
public interface GroupService {

    List<Group> findAll();

    Group findByContent(String name);

    boolean addGroup(Group group);
}
