FROM n8nio/n8n:latest

USER root

# Stage the node files — entrypoint copies them after volume mount
RUN mkdir -p /opt/custom-nodes/n8n-nodes-featurebase/dist
COPY package.json /opt/custom-nodes/n8n-nodes-featurebase/
COPY dist/ /opt/custom-nodes/n8n-nodes-featurebase/dist/

# Entrypoint: copy node into n8n's community nodes dir, then start n8n
RUN printf '#!/bin/sh\nset -e\nmkdir -p /home/node/.n8n/nodes/node_modules/n8n-nodes-featurebase\ncp -r /opt/custom-nodes/n8n-nodes-featurebase/* /home/node/.n8n/nodes/node_modules/n8n-nodes-featurebase/\nchown -R node:node /home/node/.n8n/nodes/node_modules/n8n-nodes-featurebase\necho "Featurebase node installed"\nls /home/node/.n8n/nodes/node_modules/n8n-nodes-featurebase/dist/nodes/Featurebase/\nexec tini -- /docker-entrypoint.sh "$@"\n' > /usr/local/bin/custom-entrypoint.sh \
    && chmod +x /usr/local/bin/custom-entrypoint.sh

USER node
ENTRYPOINT ["custom-entrypoint.sh"]
