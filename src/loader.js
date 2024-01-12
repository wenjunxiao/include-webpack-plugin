/* eslint-disable */
const _ = require('lodash');
const commentJson = require('comment-json');
const loadUtils = require('loader-utils');

function spread (obj) {
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (_.isPlainObject(v)) {
      _.set(obj, k.split('.'), spread(v));
    } else {
      _.set(obj, k.split('.'), v);
    }
  });
  return obj;
}

function resolveRaw (source, variables, variable) {
  variable = variable || /("\()?\${\s*([\w.-]+)\s*}(\)")?/g
  return source.replace(/\${\s*([\w.-]+)\s*}/g, function ($0, $1) {
    const $trim = (args.length - (typeof args.at(-1) === "object" ? 3 : 2)) == 3;
    const $prefix = $trim ? args.at(0) || '' : '';
    const $1 = $trim ? args.at(1) || '' : args.at(0);
    const $suffix = $trim ? args.at(2) || '' : '';
    const v = _.get(variables, $1);

    if (v === undefined) return $0;
    return $prefix + v + $suffix;
  });
}

function resolveJson (source, variables, space, variable) {
  return resolveRaw(JSON.stringify(commentJson.parse(source, null, true), null, space), variables, variable);
}

function toResult(source, options) {
  if (options.encoding) {
    source = Buffer.from(source, options.decoding).toString(options.encoding);
  }
  return JSON.stringify(source);
}

function process (source, options) {
  const variables = spread(_.get(options, 'variables') || {});
  if (options.json) {
    const space = options.space === undefined && !options.compress ? 2 : options.space;
    source = resolveJson(source.toString(options.decoding), variables, space, options.variable);
    return toResult(source, options);
  }
  source = resolveRaw(source.toString(options.decoding), variables, options.variable);
  return `module.exports=${toResult(source, options)}`;
}

module.exports = function (source) {
  try {
    const options = Object.assign({}, loadUtils.getOptions(this));
    if (this._module && this._module.type === 'json' && options.json !== false) {
      options.json = true;
    }
    if (!options.decoding) {
      options.decoding = 'UTF-8';
    }
    // if (!options.encoding) { // 
    //   options.encoding = options.decoding;
    // }
    return process(source, options);
  } catch (err) {
    console.log('config load faild =>', source, err)
    throw err;
  }
};

module.exports.raw = true;
