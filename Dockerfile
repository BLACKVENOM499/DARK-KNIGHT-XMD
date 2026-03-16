FROM node:lts-buster
RUN git clone https://github.com/bot-deploy-main/DARK-KNIGHT-XMD/root/DARK-KNIGHT-XMD
WORKDIR /root/DARK-KNIGHT-XMD
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1
COPY . .
EXPOSE 9090
CMD ["npm", "start"]
