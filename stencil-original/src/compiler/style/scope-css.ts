import * as d from '../../declarations';
import { catchError } from '../util';
import { getElementScopeId, getScopeId } from '../../util/scope';


export async function scopeComponentCss(config: d.Config, buildCtx: d.BuildCtx, cmpMeta: d.ComponentMeta, mode: string, cssText: string) {
  try {
    const scopeId = getScopeId(cmpMeta, mode);

    const hostScopeId = getElementScopeId(scopeId, true);
    const slotScopeId = getElementScopeId(scopeId);

    cssText = await config.sys.scopeCss(cssText, scopeId, hostScopeId, slotScopeId);

  } catch (e) {
    catchError(buildCtx.diagnostics, e);
  }

  return cssText;
}
