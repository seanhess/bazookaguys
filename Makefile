all: build

build:
	node_modules/.bin/tsc --out public/main.js public/app.ts

install:
	npm install
	node_modules/.bin/bower install

deploy:
	# sync all the files
	rsync -rav -e ssh --delete --exclude-from config/exclude.txt . deploy@bazookaguys:~/bazookaguys
	
	# run the remote commands
	ssh -t deploy@bazookaguys < config/deploy.sh


