const MIN_BABEL_VERSION = 7;

module.exports = (api) => {
  api.assertVersion(MIN_BABEL_VERSION);
  api.cache(true);
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          include: ["transform-block-scoping"],
          targets: {
            node: "4",
          },
        },
      ],
    ],
  };
};