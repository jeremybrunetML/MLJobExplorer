# Marklogic Jobs Explorer

Marklogic Jobs Explorer

## Deploy the service in your ML project
```bash
cp ml-modules/services/jobService.sjs /path_to_your_ml_project/srv/main/ml-modules/services/
cp ml-modules/services/jobManagement.xqy /path_to_your_ml_project/srv/main/ml-modules/services/
```

then deploy from your ML project
```bash
gradle mlLoadModules
```

## Install the dependencies
```bash
yarn
```

### update the configuration
quasar.conf.js ->   target: 'http://localhost:8013',
update the port to target your own JOB database

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

### Screenshots

![jobs dhf](https://github.com/jeremybrunetML/MLJobExplorer/images/searchDHF.png)
![jobs legacy](https://github.com/jeremybrunetML/MLJobExplorer/images/searchLegacy.png)
![jobs legacy error](https://github.com/jeremybrunetML/MLJobExplorer/images/searchLegacy2.png)
![job detail](https://github.com/jeremybrunetML/MLJobExplorer/images/jobDetail1.png)
![job detail](https://github.com/jeremybrunetML/MLJobExplorer/images/jobDetail2.png)
![stats](https://github.com/jeremybrunetML/MLJobExplorer/images/stats.png)