package cn.edu.ncu.bootwebsocketmybatis.service;

import cn.edu.ncu.bootwebsocketmybatis.entity.EvaluateInfo;

import java.util.List;

/**
 * @package: cn.edu.ncu.bootwebsocketmybatis.service
 * @project: boot-websocket-mybatis
 */
public interface EvaluateInfoService {

    List<EvaluateInfo> findAll();

    EvaluateInfo findById(Integer id);

    boolean addEvaluateInfo(EvaluateInfo evaluateInfo);

    EvaluateInfo findByContent(String content);
}
