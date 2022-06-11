#!/usr/bin/env sh

[ -z "$1" ] && {
    echo "Please provide the openssl version as the first parameter (just the version, e.g. 1.1.1f)." >&2
    exit 1
}
THIS=$(dirname $0)
THIS=$(realpath $THIS)
OPENSSL_VERSION="$1"
OPENSSL_ROOT="$THIS/openssl"
[ -d $OPENSSL_ROOT ] || mkdir $OPENSSL_ROOT || {
    echo "Failed creating openssl root folder $OPENSSL_ROOT. Aborting." >&2
    exit 1
}

cd $OPENSSL_ROOT
OPENSSL_FOLDER="$OPENSSL_ROOT/openssl-$OPENSSL_VERSION"
[ -d "$OPENSSL_FOLDER" ] && {
    echo "OpenSSL $OPENSSL_VERSION seems to already exist in $OPENSSL_FOLDER. Aborting."
    exit 1
}

echo -n "Downloading the sources... "
curl --location -sl https://www.openssl.org/source/openssl-$OPENSSL_VERSION.tar.gz | tar zx || {
    echo "failed"
    echo "Failed downloading the sources. Aborting." >&2
    exit 1
}
echo "ok"


cd $OPENSSL_FOLDER || {
    echo "Successfully downloaded and unpacked the sources, but can't access folder $OPENSSL_FOLDER. Aborting." >&2
    exit 1
}
echo "-----------------------------------------------------------"
echo "Configuring the build, this might take a couple of minutes."
echo "-----------------------------------------------------------"
./config -Wl,-rpath=$(pwd) -Wl,--enable-new-dtags || {
    echo "Something went wrong while configuring the build. Aborting." >&2
    exit 1
}

echo "-----------------------------------------"
echo "Building OpenSSL. This will take a while."
echo "-----------------------------------------"
make || {
    echo "The build failed. Aborting. Good luck with that!" >&2
    exit 1
}

echo -e "\n----------------------------------------\n"

OPENSSL_BINARY="$OPENSSL_FOLDER/apps/openssl"
$OPENSSL_BINARY version || {
    echo "This is strange. Everything seemed fine, but there are errors. Aborting." >&2
    exit 1
}
echo "Successfully built openssl $OPENSSL_VERSION in $OPENSSL_BINARY"
echo "You can now use that path in proxy.js constant \$openssl_binary."
