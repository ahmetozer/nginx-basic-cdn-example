# Nginx Basic CDN

This repository demonstrates a basic Content Delivery Network (CDN) setup using an NGINX server.

Aims of this project:

- Image Resizing
- Secure URL Access
- Scalability
- Monitoring (Grafana Prometheus)
- Rate Limiting
- Consistent Distributed Caching
- Cache Purging
- Fault Tolerance

## Architecture

This system consists of 3 Levels of deployments which each level has main different responsibilities.

- Nginx: Used for security, image resizing, and caching the content.
  - Tier1:
    - Caching pure backend content
    - Source of truth for image revalidation and Purge
  - Tier2:
    - Resize image based on request
    - Cache repetitive resizing requests
  - Tier3:
    - Rate Limiting request
    - Secure URL verification
    - Cache high demand only contents
- DNSMasq:
  - Creating consistent DNS response across the cluster for consistent load balancing at nginx upstream servers with service discovery.
- Grafana:
  - Dashboard
  - Alerting
- Prometheus:
  - Discovering Nginx instances
  - Collecting and querying metrics

## Design Considerations

### Image Resizing

Image resizing is done at Tier 2 with use of the image_filter module at nginx. Not all requests are passed to this resing functionality, only the resize path is forwarded with this function help of Nginx variables at the upstream configuration.  
After a couple of requests resize request, it will be cached on disk to prevent CPU consumption.

In this example, images are resized 100x100 which causes low-resolution images.

To try, visit [http://localhost](http://localhost/)

### Scalability

The system uses service discovery at docker-compose. Each new replica will be assigned to the service discovery response and ready to serve incoming requests.
At Kubernetes, with HPA or Keda, the automated scale can be enabled horizontally.

### Secure URL Access

Secure access is an important feature as it prevents unwanted requests at system-heavy functions or protected access within a given threshold.  

In this demo, images first try to load [http://localhost/auth/resize/x/y/image.jpg](http://localhost/auth/resize/x/y/image.jpg) and the nginx instance will return 302 signed URL information to the browser for loading the actual image. Normally this will be done at the API side for signing the URLs for given key metrics such as Path, Duration, Request IP, and Agent but it varies based on business requirements.  

The redirection function is the URL singing mechanism re-implementation at nginx with the help of the Lua module. The main reason for using the nginx lua module is building signing only supports verification. There is a more advanced module that supports HMAC singing token but this module is not available at some distros nor not maintained anymore.  

After redirection, URL has hash and expiry information which is checked by each request at nginx. Each resized image has a 3-second token, you can test by visiting  [http://localhost](http://localhost/) selecting one image, and right-clicking, choice Open a New Tab (not the image page, the image itself) after a couple of seconds refresh the page and you will get 410 Gone error. To test token validation, you can delete some characters at the md5 argument from the URL to get a 403 error.

### Rate Limiting

Most of the corporates have various rate limit implementations to protect company resources. Implementations can vary based on business, type of client, and implementation.  

For best protection, multi-level rate limiting is a good approach to handle multiple cases. In this repository, two rate limit buckets are used. One of them is the selective rate limit, which does not apply limits for internal requests.
The second one is the hard rate limit, which applies to every request.

Rate limiting has different burst configurations to not block the client's first load request. In this demo, the backend, assets (except images) will be loaded at the beginning without facing with rate limit.

Images will have a lower rate limit for demo purposes, at the home page, the first 7 images will load but the rest will not because of the rate limit. After a couple of seconds, you can try to scroll down and new images will be loaded.

### Consistent Distributed Caching

Many assets are stored in CDN systems. Duplication of those files across distributed clusters will cause high storage usage. If the requests hit a similar caching cluster for the same file, this will improve the HIT ratio of the cluster and reduce storage usage.

To achieve consistency, the system uses path values as hash keys while upstream selection.

Note: In this demo, service discovery is used for automatically scaling requests and cross-cache tiers. By default, DNS responses have round robin which means the order of response changes for each query and this breaks consistency.  
To prevent this behavior, DNSMasq is used for caching cluster service discovery responses and rr is disabled.

### Cache Purge

With Consistency at the cluster, Purging the Cache is easier. The purge request will be originated in the tier 1 cluster and the higher level cluster will revalidate the request in an interval.  

When the image is purged at tier-1 after a couple of seconds other tiers will purge their files if the same root image is requested. This system can be speed-up but more complex mechanisms and/or new tools will be required which is more suitable for short-term API response caches.

### Monitoring

The system status can be watched at [http://localhost:3000](http://localhost:3000) (username foo, pass bar). Grafana dashboard has information about, cache hit ratio, requests, and transferred data thanks to the nginx_vts module. You can group results by tier or instance.

Alerting enabled in incase of rate limit is below %80 percent. When the ratio is too low, a webhook will triggered for the tier-3 nginx instance, so you can see by docker-compose logs.

### Fault Tolerance

High availability is achieved by distributed and replicated cluster mechanisms. When the system has a faulty node, nginx upstream will try the next upstream client. This is available for each server entry under the upstream configuration and is not limited to entry.  
If the server entry host has multiple A or AAAA records, nginx will try those as well.  

As a next step, overlay networks or virtual IP addresses can be combined to prevent if multiple events occur at the same time such as an IP address change of one replica and another replica is not available and the DNS cache has not expired yet.
(Note tier-3 replica set to 1 to assign port 80)

### Performance

With this setup, you can reach 20k requests at the MacBook M1 machine with a full system resource usage or 16k requests at Raspberry Pi 5.
To be able to test higher traffic, a Kubernetes cluster with multiple nodes can be used but ensure ulimit is allowed and set to not be caught by socket limits.

Benchmark is disabled at docker to prevent an unresponsive system. You can enable it by uncommenting the k6 service.

---

## Demo environment

To start demo you need docker, docker-compose at your system.

### Building Image

```bash
docker-compose build
```

### Starting Environment

```bash
docker-compose kill; docker-compose up --remove-orphans
```
