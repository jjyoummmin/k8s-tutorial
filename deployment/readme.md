Deployment
==========
[deployments document](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

pod가 죽었을 때, 명시한 replica 개수만큼 알아서 재실행.
define blueprints for pod and specify how many replicas of that pod you would like to run

pod
---
think of it as a virtual machine 


replicaset
----------
managing the replicas of pod
실전에서 직접 replicaset을 생성,  삭제, update 할일은 없음. deploymnet를 통해 자동으로 manage 됨.


deployment
----------
blueprint for creating pod. abstraction of pods
allows us to  configure and apply deployment (app)

배포 방식으로 순서대로 명령 나열한 script 방식이 아닌 이런 상태가 됐으면 좋겠어 라는 청사진을 제공. 관리는 쿠버네티스가 알아서 해준다. actual state == desired state 되도록. 

deployment --> ReplicaSet --> Pods  --> Container

zero-downtime update
--------------------
update strategy

liveness probe
readiness probe



실습
---

yaml 요소
devops guy
resources ~

```
kubectl apply -f 
kubectl delete -f 
```

```
kubectl get pods --watch
kubectl get replicaset
kubectl get deploy
kubectl get all
```

디버깅 command
```
kubectl logs <pod>
kubectl logs -f <pod> -c <container>
kubectl describe pod <pod>
kubectl exec -it <pod> -- bin/bash
```

port-forward로 접속해보자
