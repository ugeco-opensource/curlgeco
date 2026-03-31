#!/usr/bin/env bash
set -euo pipefail

helm upgrade --install curlgeco deployment/charts/curlgeco \
  --namespace curlgeco \
  --create-namespace \
  -f deployment/charts/curlgeco/values.yaml \
  "$@"
