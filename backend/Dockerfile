FROM swiftlang/swift:nightly-5.5-bionic

COPY MovieAPI /MovieAPI

RUN cd /MovieAPI && swift build -c release

RUN apt update && apt install -y nginx
COPY nginxconfig /etc/nginx/sites-enabled/default
RUN service nginx stop

CMD service nginx start && /MovieAPI/.build/x86_64-unknown-linux-gnu/release/MovieAPI
