package cn.edu.ncu.bootwebsocketmybatis.service;

import cn.edu.ncu.bootwebsocketmybatis.entity.Evaluate;

import java.util.List;

/**
 * @package: cn.edu.ncu.bootwebsocketmybatis.service
 * @project: boot-websocket-mybatis
 */
public interface EvaluateService {

    List<Evaluate> findAllByUserId(String userid);

    boolean addByUserId(Evaluate evaluate);

    Evaluate findByUserIdAndEvaId(Evaluate evaluate);
}
