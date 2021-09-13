FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y nodejs npm

COPY MovieApp /MovieApp
RUN cd /MovieApp && npm install --force

CMD cd /MovieApp && npm start
