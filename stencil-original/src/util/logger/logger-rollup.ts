import { BuildCtx, CompilerCtx, Config, Diagnostic, ModuleFile, PrintLine } from '../../declarations';
import { buildWarn, normalizePath } from '../../compiler/util';
import { splitLineBreaks } from './logger-util';
import { toTitleCase } from '../helpers';


export function loadRollupDiagnostics(config: Config, compilerCtx: CompilerCtx, buildCtx: BuildCtx, rollupError: any) {
  const d: Diagnostic = {
    level: 'error',
    type: 'bundling',
    language: 'javascript',
    code: rollupError.code,
    header: `Rollup: ${formatErrorCode(rollupError.code)}`,
    messageText: rollupError.message,
    relFilePath: null,
    absFilePath: null,
    lines: []
  };

  if (rollupError.loc && rollupError.loc.file) {
    d.absFilePath = normalizePath(rollupError.loc.file);
    if (config) {
      d.relFilePath = normalizePath(config.sys.path.relative(config.cwd, d.absFilePath));
    }

    try {
      const sourceText = compilerCtx.fs.readFileSync(d.absFilePath);
      const srcLines = splitLineBreaks(sourceText);

      const errorLine: PrintLine = {
        lineIndex: rollupError.loc.line - 1,
        lineNumber: rollupError.loc.line,
        text: srcLines[rollupError.loc.line - 1],
        errorCharStart: rollupError.loc.column,
        errorLength: 0
      };

      d.lineNumber = errorLine.lineNumber;
      d.columnNumber = errorLine.errorCharStart;

      const highlightLine = errorLine.text.substr(rollupError.loc.column);
      for (var i = 0; i < highlightLine.length; i++) {
        if (charBreak.has(highlightLine.charAt(i))) {
          break;
        }
        errorLine.errorLength++;
      }

      d.lines.push(errorLine);

      if (errorLine.errorLength === 0 && errorLine.errorCharStart > 0) {
        errorLine.errorLength = 1;
        errorLine.errorCharStart--;
      }

      if (errorLine.lineIndex > 0) {
        const previousLine: PrintLine = {
          lineIndex: errorLine.lineIndex - 1,
          lineNumber: errorLine.lineNumber - 1,
          text: srcLines[errorLine.lineIndex - 1],
          errorCharStart: -1,
          errorLength: -1
        };

        d.lines.unshift(previousLine);
      }

      if (errorLine.lineIndex + 1 < srcLines.length) {
        const nextLine: PrintLine = {
          lineIndex: errorLine.lineIndex + 1,
          lineNumber: errorLine.lineNumber + 1,
          text: srcLines[errorLine.lineIndex + 1],
          errorCharStart: -1,
          errorLength: -1
        };

        d.lines.push(nextLine);
      }
    } catch (e) {
      d.messageText = `Error parsing: ${rollupError.loc.file}, line: ${rollupError.loc.line}, column: ${rollupError.loc.column}`;
    }
  }

  buildCtx.diagnostics.push(d);
}

const charBreak = new Set([' ', '=', '.', ',', '?', ':', ';', '(', ')', '{', '}', '[', ']', '|', `'`, `"`, '`']);


export function createOnWarnFn(config: Config, diagnostics: Diagnostic[], bundleModulesFiles?: ModuleFile[]) {
  const previousWarns = new Set<string>();

  return function onWarningMessage(warning: { code: string, importer: string, message: string }) {
    if (!warning || previousWarns.has(warning.message)) {
      return;
    }

    previousWarns.add(warning.message);

    if (warning.code) {
      if (ignoreWarnCodes.has(warning.code)) {
        return;
      }
      if (suppressWarnCodes.has(warning.code)) {
        config.logger.debug(warning.message);
        return;
      }
    }

    let label = '';
    if (bundleModulesFiles) {
      label = bundleModulesFiles.map(moduleFile => moduleFile.cmpMeta.tagNameMeta).join(', ').trim();
      if (label.length) {
        label += ': ';
      }
    }

    const diagnostic = buildWarn(diagnostics);
    diagnostic.header = `Bundling Warning`;
    diagnostic.messageText = label + (warning.message || warning);
  };
}

const ignoreWarnCodes = new Set([
  `THIS_IS_UNDEFINED`, `NON_EXISTENT_EXPORT`
]);

const suppressWarnCodes = new Set([
  `CIRCULAR_DEPENDENCY`
]);


function formatErrorCode(errorCode: any) {
  if (typeof errorCode === 'string') {
    return errorCode.split('_').map(c => {
      return toTitleCase(c.toLowerCase());
    }).join(' ');
  }

  return errorCode;
}
