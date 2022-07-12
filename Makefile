deploy:
	npx tsc
	cdk deploy

install:
	npm i
	cd src/layers/common/nodejs && npm i

