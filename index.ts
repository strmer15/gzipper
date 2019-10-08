#!/usr/bin/env node
import program from 'commander';

import { Gzipper } from './src/Gzipper';
import { GlobalOptions } from './src/interfaces';
const version = require('./package.json').version;

const {
  GZIPPER_VERBOSE,
  GZIPPER_EXCLUDE,
  GZIPPER_INCLUDE,
  GZIPPER_THRESHOLD,
  GZIPPER_GZIP_LEVEL,
  GZIPPER_GZIP_MEMORY_LEVEL,
  GZIPPER_GZIP_STRATEGY,
  GZIPPER_BROTLI,
  GZIPPER_BROTLI_PARAM_MODE,
  GZIPPER_BROTLI_QUALITY,
  GZIPPER_BROTLI_SIZE_HINT,
  GZIPPER_OUTPUT_FILE_FORMAT,
} = process.env;

program
  .version(version)
  .usage('[options] <path> [outputPath]')
  .option('-v, --verbose', 'detailed level of logs')
  .option(
    '-e, --exclude [exclude]',
    'exclude file extensions from compression, example: jpeg,jpg...',
  )
  .option(
    '-i, --include [include]',
    'include file extensions for compression, example: js,css,html...',
  )
  .option(
    '-t, --threshold [threshold]',
    'exclude assets smaller than this byte size. 0 (default)',
  )
  .option(
    '-gl, --gzip-level [level]',
    'gzip compression level -1 (default), 0 (no compression) - 9 (best compression)',
  )
  .option(
    '-gm, --gzip-memory-level [memoryLevel]',
    'amount of memory which will be allocated for compression 8 (default), 1 (minimum memory) - 9 (maximum memory)',
  )
  .option(
    '-gs, --gzip-strategy [strategy]',
    'compression strategy 0 (default), 1 (filtered), 2 (huffman only), 3 (RLE), 4 (fixed)',
  )
  .option('--brotli', 'enable brotli compression, Node.js >= v11.7.0')
  .option(
    '-bp, --brotli-param-mode [brotliParamMode]',
    'default, text (for UTF-8 text), font (for WOFF 2.0 fonts)',
  )
  .option(
    '-bq, --brotli-quality [brotliQuality]',
    'brotli compression quality 11 (default), 0 - 11',
  )
  .option(
    '-bs, --brotli-size-hint [brotliSizeHint]',
    'expected input size 0 (default)',
  )
  .option(
    '--output-file-format [outputFileFormat]',
    'output file format with default artifacts [filename].[ext].[compressExt]',
  )
  .option('', 'where:')
  .option('', 'filename -> file name')
  .option('', 'ext -> file extension')
  .option('', 'compressExt -> compress extension (.gz, .br, etc)')
  .option('', 'hash -> uniq uuid/v4 hash')
  .option('', 'samples:')
  .option('', '[filename].[compressExt].[ext]')
  .option('', 'test-[filename]-[hash].[compressExt].[ext]')
  .option('', '[filename]-[hash]-[filename]-tmp.[ext].[compressExt]')
  .parse(process.argv);

type VarType = typeof Number | typeof Boolean | typeof String;

function getVariable(
  variable: string | undefined,
  type: VarType = String,
): ReturnType<VarType> | undefined {
  return variable && type(variable);
}

const [target, outputPath] = program.args;
const options: GlobalOptions & { [key: string]: unknown } = {
  verbose: getVariable(GZIPPER_VERBOSE, Boolean) || program.verbose,
  exclude: getVariable(GZIPPER_EXCLUDE) || program.exclude,
  include: getVariable(GZIPPER_INCLUDE) || program.include,
  threshold:
    (getVariable(GZIPPER_THRESHOLD, Number) as number) ||
    Number(program.threshold) ||
    0,
  gzipLevel:
    (getVariable(GZIPPER_GZIP_LEVEL, Number) as number) ||
    Number(program.gzipLevel),
  gzipMemoryLevel:
    (getVariable(GZIPPER_GZIP_MEMORY_LEVEL, Number) as number) ||
    Number(program.gzipMemoryLevel),
  gzipStrategy:
    (getVariable(GZIPPER_GZIP_STRATEGY, Number) as number) ||
    Number(program.gzipStrategy),
  brotli: getVariable(GZIPPER_BROTLI, Boolean) || program.brotli,
  brotliParamMode:
    getVariable(GZIPPER_BROTLI_PARAM_MODE) || program.brotliParamMode,
  brotliQuality:
    (getVariable(GZIPPER_BROTLI_QUALITY, Number) as number) ||
    Number(program.brotliQuality),
  brotliSizeHint:
    (getVariable(GZIPPER_BROTLI_SIZE_HINT, Number) as number) ||
    Number(program.brotliSizeHint),
  outputFileFormat:
    getVariable(GZIPPER_OUTPUT_FILE_FORMAT) || program.outputFileFormat,
};

// Delete undefined options.
Object.keys(options).forEach(key => {
  if (options[key] === undefined) {
    delete options[key];
  }
});

const gzipper = new Gzipper(target, outputPath, options || {});
gzipper.compress().catch(err => console.error(err));