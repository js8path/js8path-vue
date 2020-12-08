# @js8path/js8path-vue
Vue.js web UI for JS8Path

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### workspace dependencies
- @js8path/js8path-vue
- @js8path/js8path-data
    - @js8path/annotated-error
- @js8path/js8path-pskreporter
    - @js8path/annotated-error
    - @js8path/js8path-data
- @js8path/js8path-route
    - @js8path/annotated-error
    - @js8path/js8path-data
    - @js8path/js8path-test-data
- js8path-test-data
    - @js8path/annotated-error
    - @js8path/js8path-data
    - @js8path/js8path-pskreporter
    
## Documentation Generation
Install JsDoc and Vuese Globally
```
yarn global add jsdoc @vuese/cli
```

To Generate Docs (in ./docs/jsdoc/ and ./docs/vuese/)
```
yarn run docgen
```

To launch documentation servers and open chrome to view them
```
yarn run docserve
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
