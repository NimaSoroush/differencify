FROM nimasoroush/differencify
RUN mkdir ./differencify
WORKDIR ./differencify
COPY ./package.json ./package-lock.json ./.eslintrc ./.eslintignore ./.babelrc ./
RUN npm install
COPY ./src ./src
VOLUME ./src/integration.tests:/differencify/src/integration.tests