/* eslint-disable */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const pluginName = 'include-webpack-plugin';

function getCompilerName (context, filename) {
  const absolutePath = path.resolve(context, filename);
  const relativePath = path.relative(context, absolutePath);
  return pluginName + ' for "' + (absolutePath.length < relativePath.length ? absolutePath : relativePath) + '"';
}

class IncludeWebpackPlugin {
  constructor(entry, options = {}) {
    this.entry = entry || {}
    this.options = Object.assign({
      filename: '[name]',
      chunkFilename: '[name]',
      environment: {
        arrowFunction: false
      },
      iife: false
    }, options || {})
    this.variable = this.options.variable;
    delete this.options.variable;
    if (this.variable === true) {
      this.variable = /\${\s*([\w.-]+?)(\.\w+)?\s*}/g;
    }
  }

  apply (compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const outputOptions = Object.assign({}, compilation.outputOptions, this.options);
      const compilerName = getCompilerName(compiler.context, outputOptions.path);
      const childCompiler = compilation.createChildCompiler(compilerName, outputOptions);
      childCompiler.context = compiler.context;
      for (const name of Object.keys(this.entry)) {
        let opts = this.entry[name];
        const filename = (typeof opts === 'object' ? opts.filename : opts).replace(/\?.*$/, '');
        if (!fs.existsSync(filename)) {
          throw new Error("file not exists:" + filename);
        }
        const entry = new SingleEntryPlugin(childCompiler.context, filename, name)
        entry.apply(childCompiler);
      }
      compilation.hooks.additionalAssets.tapAsync(pluginName, (callback) => {
        childCompiler.hooks.thisCompilation.tap(pluginName, (childCompilation) => {
          childCompilation.hooks.processAssets.tapAsync(pluginName, (assets, callback) => {
            Object.keys(this.entry).map((name, index) => {
              const asset = assets[name];
              delete assets[name];
              let opts = this.entry[name];
              if (typeof opts === 'string') {
                opts = { filename: opts };
              }
              const decoding = opts.decoding || this.options.decoding;
              const encoding = opts.encoding || this.options.encoding;
              let source = this.evaluateCompilationResult(asset.source(), name);
              if (decoding) {
                source = Buffer.from(source, decoding).toString('binary');
              }
              if (this.variable) {
                const variables = this.variables || {};
                source = source.replace(this.variable, function ($0, $1, ext) {
                  ext = ext || '';
                  let v = variables[$1 + ext];
                  if (v !== undefined) return v;
                  let entry = compilation.entrypoints.get($1);
                  if (entry && entry.chunks[0]) {
                    for (let file of entry.chunks[0].files) {
                      if (!ext || path.extname(file) === ext) {
                        return file;
                      }
                    }
                  };
                  return $0;
                });
              }
              if (encoding) {
                source = Buffer.from(source, 'binary').toString(encoding);
              }
              const webpack = compiler.webpack;
              compilation.emitAsset(name, new webpack.sources.RawSource(source, false));
            });
            callback();
          });
        });
        childCompiler.runAsChild(callback);
      });
    })
  }

  evaluateCompilationResult (source, filename) {
    if (!source) {
      throw (new Error('The child compilation didn\'t provide a result'))
    }
    const vmContext = vm.createContext(Object.assign({
      require: require,
    }, global));
    let vmScript = null
    let iife = "(function(){" + source + ";return __webpack_exports__;})()"
    try {
      vmScript = new vm.Script(iife, {
        filename
      });
    } catch (e) {
      console.log('compile error', e);
      return source
    }
    let tail = (source.match(/(\n[^\w\n]+sourceMappingURL[^\n]*)$/i) || [])[1] || '';
    let newSource = vmScript.runInContext(vmContext);
    if (typeof newSource === 'object' && newSource.__esModule && newSource.default) {
      newSource = newSource.default;
    }
    return newSource && (newSource.toString() + tail)
  }
}
module.exports = IncludeWebpackPlugin