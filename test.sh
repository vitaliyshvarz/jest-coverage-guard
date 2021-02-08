rm -rf test-app/node_modules/jest-coverage-guard/src
cp -r src test-app/node_modules/jest-coverage-guard/src
cd test-app && npm run test:unit