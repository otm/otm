Development and Staging Environment
============================================================
Javascript and CSS is build automaticly in the development environment.

Notice: If the page is in `dev` mode "(development)" is appended to the page title.
The configuration of stage and development environment is done in `app/config/bootstrap/action.php`

Managing Database Connections
============================================================
cd app/config/bootstrap
cp connections.mock connections.php

Setup user/password/database in the connections.php file

Managing Submodules - Initializing 
============================================================
To initialize submodules after cloning the project:
git submodule init
git submodule update

This is not needed it the repository is cloned recursively:
git clone --recursive git://server.com/path/arepo.git

Checking status of submodules:
git submodule
 + => older verison then in HEAD, please run git submodule update
 - => submodule is missing, please initialize

Managing Submodules - Tracking a Submodule
============================================================
git submodule update

Managing Submodules - Adding Submodules
============================================================
A new submodule can first be cloned and then added, the syntax is the same in both cases
git submodule add https://github.com/mootools/mootools-core.git build/mootools-core/

Managing Submodules - Removing Submodule
============================================================
Please read documentation...

Build - Installing lessc (CSS build dep)
============================================================
Newer versions of Ubuntu might have nodeJs package

Setup build dep:
	sudo apt-get install git-core curl build-essential openssl libssl-dev

Download latest nodeJs:
	wget http://nodejs.org/dist/

Build NodeJs:
	cd node
	./configure
	make
	sudo make install

Install npm:
	curl http://npmjs.org/install.sh | sudo sh

Install lessc:
	npm install less

Build - Javascript
============================================================
app/libraries/js/build.sh

Build - CSS
============================================================
cd app/libraries/css/bootstrap
make