FROM rust:1.93.1-alpine3.23 AS builder

RUN apk update && apk upgrade && \
    apk add --no-cache \
      musl-dev \
      gcc \
      pkgconfig \
      ca-certificates \
      upx && \
    rm -rf /var/cache/apk/*

RUN addgroup -g 10001 -S builder && \
    adduser -u 10001 -S builder -G builder

WORKDIR /build
RUN chown builder:builder /build

COPY --chown=builder:builder Cargo.toml Cargo.lock ./

USER builder
RUN mkdir -p src && echo "fn main() {}" > src/main.rs && \
    rustup target add x86_64-unknown-linux-musl

ENV RUSTFLAGS="-C target-feature=+crt-static -C opt-level=3 -C codegen-units=1 -C panic=abort -C link-arg=-s"
ENV CC_x86_64_unknown_linux_musl=gcc
ENV CARGO_TARGET_X86_64_UNKNOWN_LINUX_MUSL_LINKER=gcc

RUN cargo build --release --target x86_64-unknown-linux-musl && \
    rm -rf src target/x86_64-unknown-linux-musl/release/deps/tru_backend*

COPY --chown=builder:builder migrations ./migrations
COPY --chown=builder:builder src ./src

RUN cargo build --release --target x86_64-unknown-linux-musl

USER root
RUN strip --strip-all /build/target/x86_64-unknown-linux-musl/release/tru_backend && \
    upx --best --lzma /build/target/x86_64-unknown-linux-musl/release/tru_backend


FROM gcr.io/distroless/static-debian12:nonroot

LABEL \
    org.opencontainers.image.title="TRU Backend" \
    org.opencontainers.image.description="TRU Group backend API (Rust)" \
    org.opencontainers.image.vendor="TRU Group" \
    org.opencontainers.image.version="0.1.0" \
    security.non-root="true" \
    security.readonly-rootfs="true"

COPY --from=builder --chown=65532:65532 \
    /build/target/x86_64-unknown-linux-musl/release/tru_backend \
    /usr/local/bin/tru_backend

WORKDIR /app

ENV RUST_LOG=info
ENV RUST_BACKTRACE=0
ENV PORT=5000

USER 65532:65532

EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/tru_backend"]
