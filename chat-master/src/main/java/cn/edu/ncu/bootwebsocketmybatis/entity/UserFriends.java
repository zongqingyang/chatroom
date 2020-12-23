package cn.edu.ncu.bootwebsocketmybatis.entity;

import java.util.List;

/**
 * @package: cn.edu.ncu.bootwebsocketmybatis.entity
 * @project: boot-websocket-mybatis
 */
public class UserFriends extends User {

    private List<Friend> friendList;   //用户所有好友信息

    public List<Friend> getFriendList() {
        return friendList;
    }

    public void setFriendList(List<Friend> friendList) {
        this.friendList = friendList;
    }
}
