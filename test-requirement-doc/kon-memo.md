# kon-Memo

```shell


docker exec -it kd1-yjs-server sh
apt-get update && apt-get install -y procps

docker exec -it kd1-yjs-server sh -c "top"

-----LOG-------
docker logs <コンテナ名 or ID>
//リアルタイムで追いかける（tail -f 的な）
    bash
    docker logs -f <コンテナ名 or ID>

-----直近 N 行だけ（長期稼働コンテナ向け）
    bash
    docker logs --tail 100 <コンテナ名 or ID>

    時刻や経過時間で絞る例

    bash
    docker logs --since 10m <コンテナ名 or ID>   # 直近10分
    docker logs --since "2026-03-17T13:00:00" <コンテナ名 or ID>






```





