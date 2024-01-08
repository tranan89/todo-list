#!/usr/bin/env bash

set -euo pipefail

docker_tag="${IMAGE_TAG:-localhost/dev/backend-assignment-main:test}"

docker build \
	--rm \
	--tag="$docker_tag" \
	--build-arg="IMAGE_TAG=DEV" \
	--file="$(dirname $0)/Dockerfile" \
	"."

