// src/routes/utils/defineRoute.ts
var defineRoute = (base, prefix, relative) => ({
  raw: base + relative,
  relative_with_prefix: prefix + relative,
  relative
});

export {
  defineRoute
};
