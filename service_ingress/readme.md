Service
=======
deployment를 통해 생성한 application pod에 클라이언트의 request를 어떻게 전달할까요?   
또, application pod에서 redis pod로 요청을 보내고 싶을 때 IP 주소를 어떻게 찾을까요?   
쿠버네티스의 네트워킹에 대해 알아봅시다.

서비스가 왜 필요할까요?  
모든 pod는 클러스터 내부 IP를 부여받습니다. 그렇지만 pod는 금방 죽기도 하고, Restart  되기도 하는 존재이기 때문에 (ephemeral), 해당 app의 pod들과 안정적으로 네트워킹 하기위한 고정적인 IP 주소가 필요합니다.  
**서비스에게 부여된 Virtual IP는 고정적이고 변하지 않습니다.**  
또한 이런 stable IP address를 가진 서비스로 전달된 트래픽은 여러개의 pod로 **로드밸런싱** 됩니다.    
각 pod를 개별적으로 호출하는 대신, 서비스를 호출 하면 request를 (기본적으로는 round-robin 방식으로) 연결된 pod로 포워딩 해줍니다.



service types
-------------
### ClusterIP
default 타입. 특별히 type을 명시하지 않았을 때 서비스타입은 ClusterIP 입니다.  
오직 클러스터 내부에서만 접근 가능한 internal service 입니다.

 
서비스가 어떤 pod, port에 forwarding 해야하는지 어떻게 알고 있을까? 
- selector (member pod, endpoint pod )
- targetport

```yaml
ports:
  - protocol: TCP
  port: 3200   # arbitrary 
  targetPort: 3200   # has to match containerPort!
```

multiport service  
port 명세에 이름 부여할 것

서비스를 생성하면 서비스는 endpoint object를 생성함. 서비스와 같은 이름인
```
kubectl get endpoints
```
keeptrack of which pods are members/endpoints of service
pod에 변동 생길때마다 dynamic하게 최신 상태 유지. 
 


### Headless
클라이언트/pod가 하나의 specific pod랑 direct 소통하고 싶을 때  

use case
- stateful application like databases. pod replicas are not identical / worker-master



해당 pod ip address를 얻는 방법
1) k8s api server에 api call
- 비효율적, app이 k8s api에 강결합되게 되서 별로 좋지 않음
2) DNS lookup
- 기본적으로는 서비스의 clusterIP를 되돌려주지만 headless로 지정하면 pod의 IP 리턴함.


setting clusterIP : none

일반적인 역할을 하는 ClusterIP 서비스를 두고, 직접 연결해야 하는 pod에 headless 서비스를 별도로 둔다. 

### NodePort
clusterip : only accessible within cluster
no external traffic can directly  
nodeport : 각 worker node의 고정된 port를 통해서 접근 가능 하다.  

해당 포트번호는 nodeport attribute에 명시
30000 - 32767 사이의 값이어야함. 

이 타입의 서비스를 생성하면 모든 worker 노드의 노드포트가 오픈됨.

보안에 좋지 않음, 테스트를 위해서만 사용할 것.
not for production 

### LoadBalancer
nodeport 보다 나은 대안. 
accessible externally through cloud providers loadbalancer
  
이 로드밸런서를 생성해서  거기를 통해서 external 트래픽을 받음. 
GCP, AWS, Azure, linode, openstack 등등

여기서 명시하는 nodeport는 worker node의 포트이긴 한데, 아무 클라이언트나 거기로 직접 접근 가능한게 아니라,  로드밸런서가.
extension of clusterip type 


원리
---
[심화 이해 : kubernetes 내부의 packet flow](https://learnk8s.io/kubernetes-network-packets)  
ㄴ 클러스터 내부의 네트워킹에 대해 쉽고 자세하게 설명되어 있으니 꼭 한번 읽어보시길 추천드립니다 👍  
[(참고) linux network namespace](https://www.youtube.com/watch?v=j_UUnlVC2Ss)  

서비스는 실질적인 process가 아니라 abstract layer입니다.   
(밑에서 설명하겠지만 kube-proxy에 의해 각 worker node의 iptables 룰이 업데이트 되는 것입니다.)  

클러스터 내부의 pod-A 에서 서비스 url `http://foo` 를 호출했을 때, 패킷 전달 과정을 살펴볼까요?

### 1) DNS 조회
`http://foo` 를 서비스의 virtual IP인 `172.30.0.1` (예를 들자면)로 바꿉니다. 

```
minikube start

kubectl get all --all-namespaces
```
![coredns](../image/coredns.png)

아직 아무것도 생성하지 않은 기본 minikube 클러스터를 확인해보면, coredns 서비스, deployment, replicaset 그리고 pod이 돌고 있는 것을 확인할 수 있습니다.  
[dns for services and pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)  

쿠버네티스는 클러스터 내에 DNS pod과 서비스를 운영하고 (kube-system 네임스페이스에),   
kubelet을 통해서 각 컨테이너가 DNS resolution에 위의 DNS 서비스, pod를 이용할 수 있도록 합니다. (DNS 서비스 IP 주소를 통해 DNS pod에 접근..)  
모든 쿠버네티스 서비스는 이 DNS pod에 레코드 생성이 되어있으므로, client pod가 서비스의 Virtual IP 대신 DNS name으로 호출할 수 있습니다.  

(참고) coredns vs kube-dns

쿠버네티스에서 DNS라는 키워드로 검색하다보면 kube-dns와 coreDNS 라는 2가지가 검색되었는데요, k8s version 1.11, 1.12 이후 부터 kube-dns에서 coreDNS로 세대교체가 된듯 합니다.   
단, 기존 application들의 dependency 때문에 coreDNS 도입 이후에도, DNS 서비스의 명칭만은 kube-dns로 남겨둔 듯 합니다.

[Why are both Kube-DNS and CoreDNS installed by default?](https://github.com/weaveworks/eksctl/issues/891)  
[Cluster DNS: CoreDNS vs Kube-DNS](https://coredns.io/2018/11/27/cluster-dns-coredns-vs-kube-dns/#:~:text=CoreDNS%20is%20a%20single%20container,caching%20in%20the%20default%20deployment.)  

#### DNS 관련 실습
[Hands-On Kubernetes - CoreDNS & DNS Resolution](https://www.youtube.com/watch?v=OKnOc4I-7sA)  
[Debugging DNS Resolution](https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/) 

먼저 DNS 서비스 IP를 확인해볼까요?
```
kubectl get svc kube-dns -n kube-system
```
![dns svc IP address](../image/kube_dns_ip.png)  
부여된 Cluster IP는 `10.96.0.10` 이네요.

실습을 위해  클러스터에 샘플 deployment와 service를 생성합시다.
```
kubectl apply -f deployment/deployment.yaml
kubectl expose deployment hello-world
```
이제 동작하고 있는 pod 중 하나의 shell에 접속해서 다음 명령어를 쳐보세요.
```
kubectl exec -it <pod> -- bash

cat /etc/resolv.conf
```
![resolv.conf](../image/resolv.conf.png)  
좀전에 확인한 `10.96.0.10` 가 네임서버로 지정되어 있는 것을 확인할 수 있습니다.
> resolv.conf is the name of a computer file used in various operating systems to configure the system's Domain Name System (DNS) resolver.

```
curl http://hello-world:8080
```
![call_service](../image/call_service.png)
해당 pod에서 서비스 url로 (ip address 대신 서비스의 DNS name) curl command 를 쳐도 당연하게도 정상적인 response를 받을 수도 있습니다.

```
apt update
apt-get update dnsutils

nslookup hello-world
```
![nslookup](../image/nslookup.png)
![nslookup](../image/nslookup2.png)

kubectl을 통해서 확인한 hello-world 서비스의 ip 주소와 pod 내부에서 네임서버를 통해 resolve한 hello-world 서비스의 ip 주소도 모두 `10.107.162.97`로 동일한 것을 확인할 수 있습니다.


### 2) netfilters / iptables

podA에서 보낸 패킷이 destination ip를 찾아가는 과정에서, (`netfilter` hook이 trigger 되어 `iptables` 필터링을 통해..) 패킷의 destination이 서비스의 virtual IP `172.30.0.1` 에서 서비스에 endpoint로 연결된 pod들 중 하나의 cluster ip로 바뀌게 됩니다. 

![packet flow](../image/packet_flow.png)
![service principle](../image/service_principle.jpeg)

서비스를 create하거나 update하면 각 워커노드에서 돌아가고 있는 `kube-proxy`가 api-server를 통해 control plane의 변경사항을 지켜보다가, 리눅스의 iptables를 업데이트 시켜주는 것이라고 합니다!

kube-proxy 모드도 세가지 정도 (`user space`, `iptables`, `IPVS`)가 존재하는데, iptables mode가 default인 것 같습니다.  
[K8s: A Closer Look at Kube-Proxy](https://betterprogramming.pub/k8s-a-closer-look-at-kube-proxy-372c4e8b090)  

![kube-proxy iptables mode](../image/iptables_mode.png)

리눅스를 구성하는 네트워크 component인 iptables, netfilters는
> **netfilter** : implements firewall and routing capabilities within the kernel. configure packet filtering, create NAT or port translation rules, and manage the traffic flow in the network.

> **iptables** : userspace interface to the linux kernel's netfilter system. configure the IP packet filter rules  

이런거라고 하는데, 솔직히 잘 모르겠습니다. 다음을 기약하며 넘어가도록 하죠.  

위의 첫번째 packet flow 이미지에서 같은 각 pod를 위한 리눅스 네트워크 네임스페이스 생성, veth, bridge 설정 같은 low level 네트워크 작업은 `CNI` 가 담당해주는 것 같습니다.

아무튼 요약하자면, 각 워커노드의 kube-proxy가 서비스 변경사항을 지켜보고 있다가 그에 따라 리눅스 iptables를 업데이트 해두면, cluster 내부에서 packet이 destination으로 라우팅 되는 어떤 과정에서 netfilter hook에 걸려 `서비스 Virtual IP` -> `연결된 실제 pod IP` 로 패킷 destination이 수정된다는 것이 제가 이해한바 입니다.


실습
---
#### 같은 클러스터 내에서 url로 서비스에 접근하기
`{protocol}{service}.{namespace}` 

![proxy-app](../image/proxy-app.jpeg) 

예) `http://hello-app-service.helloworld`

같은 네임스페이스면 네임스페이스 부분 생략 가능

회사 코드에서 봤던 url 중에 `redis://redis:6379` 는 같은 네임스페이스에 있는 redis 라는 이름의 서비스의 주소였던 것입니다!

```
kubectl create namespace helloworld
kubectl apply -f service_ingress/proxy-app.yaml
kubectl apply -f service_ingress/hello-app.yaml

kubectl port-forward deployment/proxy-app 3000:3000
```
![proxy-app-result](../image/proxy-app-result.png)



#### service type 별로 생성해보기
https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/



#### 원리 실습
pod 안에서 nslookup
https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/



Ingress
=======
https, domain name
all about serving traffics to the outside world 
각 서비스마다 external ip를 가지는 것은 not recommended .
use it like api gateway


external service 대신 ingress + internal service(cluster ip 타입)

config
paths = url path
backend = 타겟 서비스 
hosts = valid domain name
이 도메인 네임과 클러스터의 entrypoint가 매핑되어야함.  

rule ~ 같은 도메인 호스트에서 다른 서비스로 
or subdomain

ingress가 서비스를 찾는 법  
define ingress rules - forward request based on the request address 
find service by its name
dns resolution map service name - ip addr 

ingress componenet => 라우팅 룰
ingress controller =>  ingress 구현체. another set of pods. evaluate and processes ingress rule
하는일
- evaluate all the rules : you may have 50 ingress rules(componenets) 
- manage redirections 
- entrypoint to cluster 
여러가지 3rd party implementation이 있다.
 
그중 하나는 쿠버네티스 nginx ingress controller

nginx
ha proxy
traefik
envoy
등등의 modern proxy어느 것이든 ingress 컨트롤러로 동작할 수 있음
직접 이런 proxy를 다룰 필요가 없음. ingress rule 담긴 config file만 apply 하면 됨.

cloud일때 - loadbalancer 
bare metal - external proxy server. separate server, public ip, port를 통해 only one accessible entry point to cluster. 다른 클러스터 서버는 외부에서 접근 불가능 하도록

실습
---
minikube ingress controller 설치하기
```
minikube addons enable ingress

kubecl get pods -n kube-system
```
자동으로 쿠버네티스 nginx implementation of ingress controller를  시작함. 
nginx-ingress-controller 러닝하고 있는 것 확인할 수 있다.

ingress rule 생성하기
``` 
kubectl apply

kubectl get ingress --watch
```
address assign 되는지 보기

edit /etc/hosts file


#### default backend
```
kubectl describe  ingress <ingress>
```
아무 ingress rule에도 매핑되지 않는 리퀘스트가 전달되었을 때 이 default 백엔드가 리퀘스트 핸들링 함. 
page-not-found 같은 커스텀 에러 메세지를 사용하고 싶으면 이걸 활용할 것 or redirect 

default-http-backend라는 같은 이름으로 internal service를 하나 생성하고 , custom error 메세지 뿌리는 app pod 하나 만들 것  


#### TLS certificate
 `spec.tls` 섹션 활용. secretname -> referece secrets that holds   tls certificate

 value는 file path가 아니라 actual content 여야함. 
 ingress component와 같은 네임스페이스에 생성해야한다. 




