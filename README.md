k8s-tutorial
============

개요
---
[TechWorld with Nana](https://www.youtube.com/c/TechWorldwithNana)  
[That Devops Guy](https://www.youtube.com/c/MarcelDempers)  
[Devops Toolkit](https://www.youtube.com/c/DevOpsToolkit)  

`container orchestration tool`  
잘 정리된 인터넷 자료나 책을 참고해서 쿠버네티스 기초를 학습하기 위한 따라하기 자료를 만들어 봅시다. ⛴  

목차
---
#### Basic 
* [Local k8s tool](./local_k8s)
  - minikube
  - kind
  - docker desktop
* [Basic architecture](./basic_architecture)
* [Deployment](./deployment)
* [ConfigMap / Secrets](./configmap_secrets)
* [Namespaces](./namespace)
* [Service / Ingress](./service_ingress) 😎
* [Job / CronJob](./job)

#### Intermediate
* [API Gateway](./api_gateway)
  - Kong
  - Gloo Edge
  - Zuul
* [Service Mesh](./service_mesh)
  - Istio (chaos test, jwt)
* [Auto scaling]()
* [Helm]()
* [StatefulSet / Volumes]()
  - proxysql
* [k8s on cloud]()
  - EKS
  - GKE
* [CI / CD]()
  - ArgoCD
  - Jenkins
  - github action
* [Logging]()
  - fluentbit
  - ELK
* [Monitoring]()
  - kube-ops-view
  - grafana
  - prometheus
  - datadog  

#### Advanced
* [RBAC]()  
  - RBAC
  - service accounts
* [Webhook]()
* [Vault]()


