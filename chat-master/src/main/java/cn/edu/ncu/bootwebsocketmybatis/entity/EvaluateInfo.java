package cn.edu.ncu.bootwebsocketmybatis.entity;

/**
 * @package: cn.edu.ncu.bootwebsocketmybatis.entity
 * @project: boot-websocket-mybatis
 */
public class EvaluateInfo {

    private int id;
    private String content;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "EvaluateInfo{" +
                "id=" + id +
                ", content='" + content + '\'' +
                '}';
    }
}
