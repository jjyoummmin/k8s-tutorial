Local k8s Tool
==============
로컬에서 쿠버네티스를 실행할 수 있도록 해주는 tool들을 알아봅시다.  
로컬 환경에서 테스트 해보고 싶을 때 사용하면 됩니다.


minikube
--------
[minikube documentation](https://minikube.sigs.k8s.io/docs/start/)

hypervisor나 docker 위에서 동작하는 1 node k8s cluster.  
마스터 프로세스와 워커 프로세스 모두가 이 하나의 가상머신 혹은 도커 컨테이너 안에서 동작합니다. 

설치하기
mac os 기준으로 정리하겠습니다. 다른 환경은 위의 documentation을 참고해주세요.
```
brew install minikube
```

클러스터 시작하기
```
minikube start
```

클러스터 삭제하기
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
[kind documentation](https://kind.sigs.k8s.io/)

docker desktop
--------------
[docker k8s documentation](https://docs.docker.com/desktop/kubernetes/)

--------------

# kubectl
위의 도구들로 로컬 환경에서 클러스터를 구성했다면 k8s command line tool인 kubectl을 이용해서 원하는대로 클러스터를 조작하면 됩니다.  
master 프로세스 중 하나인 `Api Server` 와 통신하는 방법은 `ui`, `api`, `cli (kubectl)` 등이 있는데 그 중 kubectl이 가장 많은 기능을 제공하는 client 입니다.

설치
---
minikube를 설치 했다면 dependency로 kubectl도 함께 설치됩니다.


