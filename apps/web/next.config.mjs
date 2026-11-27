const config = {
  poweredByHeader: false,
  skipTrailingSlashRedirect: false,
  async rewrites() {
    return [
      { source: '/', destination: '/zh-hant' },
      {
        source: '/:page(ambassador|knowledge-hub|solutions|video-studio|demo|admin|about|contact)',
        destination: '/zh-hant/:page',
      },
    ]
  },
}

export default config
