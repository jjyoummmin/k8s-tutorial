Local k8s Tool
==============
로컬에서 쿠버네티스를 실행할 수 있도록 해주는 tool들을 알아봅시다.  
로컬 환경에서 테스트 해보고 싶을 때 사용하면 됩니다.


minikube
--------
[minikube documentation](https://minikube.sigs.k8s.io/docs/start/)

hypervisor나 docker 위에서 동작하는 1 node k8s cluster.  
마스터 프로세스와 워커 프로세스 모두가 이 하나의 가상머신 혹은 도커 컨테이너 안에서 동작합니다. 

#### 설치하기  
mac os 기준으로 정리하겠습니다. 다른 환경은 위의 documentation을 참고해주세요.
```
brew install minikube
```

#### 클러스터 시작하기
```
minikube start
```

#### 클러스터 삭제하기
```
minikube delete
```

(참고)  
mac 기준 default는 docker이지만, 다른 가상화 드라이버를 사용해서 minikube 클러스터를 띄우고 싶다면  
[minikube drivers](https://minikube.sigs.k8s.io/docs/drivers/)
```
minikube start --driver={driver name} --profile
```

다른 유용한 command
```
minikube dashboard

minikube status

minikube ip

minikube logs
```

kind
----
[kind documentation](https://kind.sigs.k8s.io/docs/user/quick-start/)


#### command
```
brew install kind

kind create cluster --name {cluster name}

kind delete cluster --name {cluster name}
```

#### 다른 tool과의 비교

kind는 cluster 노드로 Docker Container를 사용합니다.  
minikube, docker-desktop과의 가장 큰 차이점은 
- docker를 사용하기 때문에 가상화 드라이버로 virtual machine을 사용하는 경우보다 훨씬 빠르다.   
(이 이유로 linux에서는 kind가 훨씬 빠르지만, mac이나 window에서는 속도 차이가 별로 없다고 합니다.) 
- config file을 사용해서 클러스터를 커스텀하게 구성할 수 있기 때문에 로컬에서도 multi-node 클러스터를 구성하고 테스트해 볼 수 있다는 장점이 있다.   
(minikube, docker-desktop은 1 node cluster.)

```
kind create cluster --config multi-node.yaml
```
```
# a cluster with 3 control-plane nodes and 3 workers

kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: tcp 
- role: control-plane
- role: control-plane
- role: worker
- role: worker
- role: worker
```
- multi-node 같은 복잡한 환경 구성이 필요 없다면 minikube가 훨씬 user-friendly한 plugin (`addons`)을 많이 제공한다.  
이를테면 nginx-ingress controller 같은. `minikube addons enable ingress`




docker desktop
--------------
[docker k8s documentation](https://docs.docker.com/desktop/kubernetes/)

![docker-desktop kube enable](https://docs.docker.com/desktop/images/kube-enable.png)

preferences > kubernetes > Enable Kubernetes 체크하고 Apply & Restart

# kubectl
위의 도구들로 로컬 환경에서 클러스터를 구성했다면 k8s command line tool인 kubectl을 이용해서 원하는대로 클러스터를 조작하면 됩니다.  
master 프로세스 중 하나인 `Api Server` 와 통신하는 방법은 `ui`, `api`, `cli (kubectl)` 등이 있는데 그 중 kubectl이 가장 많은 기능을 제공하는 client 입니다.

설치
---
```
brew install kubectl
```
minikube의 경우에는 minikube 설치 시 dependency로 kubectl도 함께 설치됩니다.


common use case of kubectl
--------------------------

[kubectl cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

#### 클러스터에 resource 생성, 변경, 삭제하기
```
# CRUD

kubectl create deployment {name}
kubectl edit deployment {name}
kubectl delete deployment {name}
```

```
# CRUD using config file

kubectl apply -f {file name}
kubectl delete -f {file name}
```


#### 클러스터 resource 리스트 가져오기
```
# status of k8s components 
# -o wide 옵션으로 상세 출력

kubectl get nodes|pods|services|replicaset|deployment
```


#### 클러스터 resource 상세보기
```
# debugging pods

kubectl logs {pod name}
kubectl describe pod {pod name}
kubectl exec -it {pod name} --bin/bash
```



kubeconfig file
---------------  
default path : `$HOME/.kube/config`  
lusters, users, namespaces, and authentication mechanisms에 대한 정보를 관리하기 위해 사용하는 config 파일.  
kubectl command-line 툴은 명령의 대상이 될 current cluster를 선택하고, 해당 클러스터의 API 서버와 통신하기 위한 정보를 찾기위해 kubeconfig file을 사용합니다.  
기본적으로 kubectl은 `$HOME/.kube` 디렉토리에서 config 파일을 찾지만,
`KUBECONFIG` 환경변수나 `--kubeconfig` flag 세팅을 통해 다른 config 파일을 사용하도록 할 수도 있습니다.
