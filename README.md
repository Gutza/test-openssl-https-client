# OpenSSL Test Client Workbench

I built this workbench while investigating a [bug in Azure](https://stackoverflow.com/questions/72545162/unexpected-post-size-limit-for-azure-app-service-with-tls-mutual-authentication/72582490)
which stumped me for a few frustrating days. I wanted to be able to **test making HTTPS requests to servers using various versions of OpenSSL*
without messing up my computer's default libraries.

## Hello world
1. Clone the repo locally;
1. Start the proxy: `node proxy.js`
1. Visit (http://localhost:8080/)[http://localhost:8080/]

Notice that you're using **http**://localhost:8080 to access **https**://www.google.com/ using the openssl binary specified in variable `openssl_binary` to handle the TLS layer.

## Using other versions of OpenSSL
1. Clone the repo locally, if you haven't already;
1. Download and build any official version of OpenSSL by running `./setup-openssl.sh 1.1.1n` (or any other version number, including 3.x);
1. Assuming everything works out well, you'll get a confirmation message at the end of the script which includes the full path to the binary.
   Use that path to replace the value of `openssl_binary` in `proxy.js`;
1. Start the proxy: `node proxy.js`
1. Visit (http://localhost:8080/)[http://localhost:8080/]

Notice that you're now using the newly-compiled openssl to handle the TLS layer.

## Other scenarios
You'll typically want to test your own website. Edit `remoteHost` and `remotePort` to indicate where you want the proxy to connect.

If you want to use mutual TLS authentication or any other openssl option just append stuff to the `openssl_params` array in `proxy.js` (there's already an example commented out in there).
Whatever you do, don't remove parameter `-ign_eof`.

If you want to bind locally to another port just change the value of `localPort` in `proxy.js`.

You can of course use `curl`, `wget`, or any other thing which understands HTTP in order to send requests and parse responses, instead of your browser; use tunnels or VPNs to expose the endpoint wherever.

## Known limitations
I implemented this as a one-off investigative tool, so there are tons of limitations:
- you can't set up anything dynamically, or even at runtime (the path to the OpenSSL binary, the local port, remote host, and remote port are all hard-coded);
- the code is really poorly optimized and not robust enough (there are a few scenarios where the whole thing comes crashing down; I never had the time, nor the interest to investigate and fix that);
- connections are not handled elegantly at all – the proxy has extremely limited understanding of what it's doing, so it just keeps sockets laying around until something dies;
- the way I'm injecting the Host header will bring shame to my family for generations to come.