#!/bin/bash

# Get directory of script
DIR="$( cd "$( dirname "$0" )" && pwd )"
WEBROOT=${DIR}/../../webroot/
PACKAGER=${DIR}/packager/packager
VER_SCRIPT=${DIR}/otm.version.php
COMPILE="java -jar closure-compiler/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --charset utf-8"

check_dep(){
	which java > /dev/null
	if [ $? != "0" ]; then
		echo "Java is missing, please install or check path"
		exit 1
	fi
}

unregister(){
	echo "Removing old entries"
	$PACKAGER list 2>&1 | grep '^Core:' && $PACKAGER unregister Core
	$PACKAGER list 2>&1 | grep '^More:' && $PACKAGER unregister More
	$PACKAGER list 2>&1 | grep '^Behavior:' && $PACKAGER unregister Behavior
	$PACKAGER list 2>&1 | grep '^More-Behaviors:' && $PACKAGER unregister More-Behaviors
	$PACKAGER list 2>&1 | grep '^Clientcide:' && $PACKAGER unregister Clientcide
	$PACKAGER list 2>&1 | grep '^MochaUI:' && $PACKAGER unregister MochaUI
	# Removed webPrun, it will have a seperate build
	#$PACKAGER list 2>&1 | grep '^WebPrune:' && $PACKAGER unregister WebPrune
	$PACKAGER list 2>&1 | grep '^Bootstrap:' && $PACKAGER unregister Bootstrap
	$PACKAGER list 2>&1 | grep '^OpenTrailmap:' && $PACKAGER unregister OpenTrailmap
	$PACKAGER list 2>&1 | grep '^SimpleModal:' && $PACKAGER unregister SimpleModal
}

register(){
	echo "Adding packages"
	$PACKAGER register ${DIR}/mootools-core/
	$PACKAGER register ${DIR}/mootools-more/
	$PACKAGER register ${DIR}/behavior/
	$PACKAGER register ${DIR}/more-behaviors/
	$PACKAGER register ${DIR}/clientcide/
	$PACKAGER register ${DIR}/mochaui/
	# webPrune will have a seperate build
	#$PACKAGER register ${DIR}/webPrune/
	$PACKAGER register ${DIR}/mootools-bootstrap/
	$PACKAGER register ${DIR}/otm/
	$PACKAGER register ${DIR}/simplemodal/	
}

init() {
	unregister
	register
}

list() {
	$PACKAGER list
}

# Debug
#echo "Working directory: ${DIR}"

# Check dependencies
check_dep

# Get new version
VERSION=$1

if [ -z "$1" ]
then
        VERSION=`cat $DIR/version.id`
else

	if [ $VERSION == "init" ]; then
		init
		exit
	fi

	if [ $VERSION == "list" ]; then
		list
		exit
	fi

	if [ $VERSION == "register" ]; then
		register
		exit
	fi

	if [ $VERSION == "unregister" ]; then
		unregister
		exit
	fi
fi

#Update build number
#BUILD=`cat $DIR/build.id`
#OLD_BUILD=$BUILD
#BUILD=$(( $BUILD + 1 ))
#echo "Build: $BUILD"
#echo $BUILD > $DIR/build.id

# Update version number
#echo "Version: $VERSION"
#echo $VERSION > $DIR/version.id

# create script
#echo "Creating PHP defines: $VER_SCRIPT"
#echo "<?php" > $VER_SCRIPT
#echo "define('BUILD', $BUILD);" >> $VER_SCRIPT

# Build javascript

################ bootstrap.js ##########################
echo "Building bootstrap.src.js"
${DIR}/packager/packager build Core/* More/* Bootstrap/* > ${WEBROOT}/js/bootstrap.src.js

echo "Compiling bootstrap.js"
${COMPILE} --js ${WEBROOT}/js/bootstrap.src.js  --js_output_file ${WEBROOT}/js/bootstrap.js

# This should be a special build option
# echo "Creating build taged: bootstrap.${BUILD}.js"
# cp ${DIR}/../js/bootstrap.js ${WEBROOT}/js/bootstrap.${BUILD}.js

# if [ -f ${WEBROOT}/js/bootstrap.${OLD_BUILD}.js ]; then
# 	echo "Removing old build file: bootstrap.${OLD_BUILD}.js"
# 	rm ${WEBROOT}/js/bootstrap.${OLD_BUILD}.js
# fi

############### opentrailmap.js ########################
echo "Building opentrailmap.src.js"
${DIR}/packager/packager build OpenTrailmap/* +use-only OpenTrailmap SimpleModal > ${WEBROOT}/js/opentrailmap.src.js

echo "Compiling opentrailmap.js"
${COMPILE} --js ${WEBROOT}/js/opentrailmap.src.js --js_output_file ${WEBROOT}/js/opentrailmap.js

# Removed, this should be a special build option
# echo "Creating build tagged: opentrailmap.${BUILD}.js"
# cp ${DIR}/../js/opentrailmap.js ${WEBROOT}/js/opentrailmap.${BUILD}.js

# if [ -f ${WEBROOT}/js/opentrailmap.${OLD_BUILD}.js ]; then
# 	echo "Removing old build file: opentrailmap.${OLD_BUILD}.js"
# 	rm ${WEBROOT}/js/opentrailmap.${OLD_BUILD}.js
# fi

