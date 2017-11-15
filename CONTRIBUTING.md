Differencify operates under a forking model. In order to contribute, please fork the project and submit a PR. Once the merge request has been accepted you will be able to see your change available on master.
## Notes
* This library been developed and tested by latest version of node. Please check .nvmrc for node version
* Please raise an issue to discuss the change
* Please add enough unit test for coverage 
* Please update README.md & CHANGELOG.md
* Please update the version number on package.json
* References to the new dependency updated accordingly

## Integration tests
* All integration tests needs to be validated after any change

### steps
- Open terminal
- cd to project root and build image
```
docker build -t differencify .
```
- And then run
```
docker run -t -d --name differencify differencify
```
- To run integration tests run
```
docker exec -it differencify npm run test:integration
```
- Then copy over generated snapshots
```
docker cp differencify:/differencify/src/integration.tests/__image_snapshots__/ src/integration.tests/
```
- To stop container run
```
docker stop differencify
```
- To remove container
```
docker rm differencify
```

## Maintainer
Project is maintained by [Nima Soroush](https://github.com/NimaSoroush).