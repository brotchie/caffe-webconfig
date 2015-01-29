FROM dockerfile/nodejs

ADD . /src/
WORKDIR /src

RUN npm install -g browserify
RUN npm install

EXPOSE 80
CMD npm run-script serve
