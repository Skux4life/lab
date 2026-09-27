# AWS EKS cluster with GitOps
Terraform file that provisions an AWS EKS cluster and other necessary resources.
Includes configuration to setup Flux on the kubernetes cluster.

## Prerequisites

### GitHub repo
A GitHub repo that will have the kubernetes manifests that Flux will apply.

Using the gh cli.
```bash
gh auth login # follow prompts
gh repo create # repo name in this example is mercury-gitops
```

### SSH Deploy Key
1. Generate a key pair

```bash
ssh-keygen -t ed25519 -f ~/.ssh/mercury -N "" -C "mercury-gitops-deploy-key"
```


2. Add the public key to the gitops repo:

```bash
gh repo deploy-key add ~/.ssh/mercury.pub \
  --repo Skux4life/mercury-gitops \
  --title "flux-deploy-key"  \
  --allow-write
```
