## Objective[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/11-Nvidia-NIM.ipynb#Objective)

By the time you complete this notebook you will be able to:

- Understand what NVIDIA Inference Microservices (NIMs) are
- Know how we will utilize the NVIDIA API Catalog to conduct prompt engineering
- Understand the benefits of local NIM deployment for production workloads

---

## NVIDIA Inference Microservices[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/11-Nvidia-NIM.ipynb#NVIDIA-Inference-Microservices)

NVIDIA NIM is a set of easy-to-use microservices designed for secure, reliable deployment of high performance AI model inference across the cloud, data center and workstations. Supporting a wide range of AI models, including open-source community and NVIDIA AI Foundation models, it ensures seamless, scalable AI inferencing, on premises or in the cloud, implementing industry standard APIs.

---

## The NVIDIA API Catalog[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/11-Nvidia-NIM.ipynb#The-NVIDIA-API-Catalog)

The **NVIDIA API Catalog,** accessible at [**build.nvidia.com**](https://build.nvidia.com/explore/discover), provides instant access to a variety of NIM-powered endpoints. You can browse available models ranging from open-source LLMs such as [**Nemotron 3 Super**](https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b) to image generation models such as [**Stable-Diffusion-XL**](https://build.nvidia.com/explore/visual-design#stable-diffusion-xl) and [**FLUX.1**](https://build.nvidia.com/black-forest-labs/flux_1-dev).

On the API Catalog, you can preview how a model will perform by interacting with the Graphical User Interface, and you can obtain API keys to interact with the models programmatically.
![[Pasted image 20260901110453.png]]


---

## The Course Environment[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/11-Nvidia-NIM.ipynb#The-Course-Environment)

For ordinary prompt examples, this course uses the NVIDIA API Catalog to access [**meta/llama-3.2-11b-vision-instruct**](https://build.nvidia.com/meta/llama-3.2-11b-vision-instruct). Later notebooks use [**nvidia/nemotron-3-nano-30b-a3b**](https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b) for structured output, tools, agents, assessment, and explicit reasoning. The API Catalog lets us develop prompt engineering skills without managing GPU infrastructure.

We've configured this environment with the necessary credentials to access the API, so you can focus on learning prompt engineering techniques rather than setup details.

Using the API Catalog is an excellent way to:

- **Prototype quickly**: Start experimenting with models immediately without any infrastructure setup
- **Learn and iterate**: Develop your prompt engineering skills with fast feedback loops
- **Explore models**: Try different models to find the best fit for your use case

---

## Moving to Local Deployment with NIM[¶](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/11-Nvidia-NIM.ipynb#Moving-to-Local-Deployment-with-NIM)

While the API Catalog is great for learning and prototyping, you may eventually want to deploy NIMs locally or in your own infrastructure. NIM microservices are packaged as container images on a per model/model family basis, and can be deployed on NVIDIA GPUs with sufficient memory.
![[Pasted image 20260901110512.png]]


Local NIM deployments offer several benefits for production workloads:

- **Speed**: LLM NIM microservices are supported with pre-generated optimized engines for a diverse range of cutting edge LLM architectures, allowing for low latency when making inference.
- **Cost at Scale**: API-hosted LLMs can become expensive for large-scale or high-volume needs. Local deployments offer a more cost-effective solution for production workloads, as you can scale by adding computing resources or distributing across multiple machines.
- **Data Privacy**: Keep sensitive data within your own infrastructure rather than sending it to external APIs.
- **Customization and Control**: Running a model locally gives you full control over your AI applications, including the ability to fine-tune models and customize the serving infrastructure.

---

## Conclusion[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/11-Nvidia-NIM.ipynb#Conclusion)

In this notebook you were introduced to NVIDIA NIM microservices and the API Catalog. The API Catalog makes it easy to get started with powerful language models, and when you're ready for production, you can deploy NIMs in your own infrastructure.

Now let's proceed to the next notebook, where you will begin to interact with the Llama 3.2 11B Vision Instruct endpoint through the API Catalog.

---

Continue the unified course path

**Next step:** Open `1-Intro-to-Prompting/12-Hello-OpenAI.ipynb` next: **Hello World with OpenAI Library**.

**Before moving on:** Keep one concrete route or model inventory detail in mind, because the next notebook turns that runtime surface into your first inspectable client request.

Click to add a cell.