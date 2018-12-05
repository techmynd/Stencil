import * as d from '../../declarations';
import { catchError } from '../util';
import { deriveModules } from './derive-modules';
import { generateBundleModules } from './bundle-modules';


export async function generateModuleMap(config: d.Config, compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx, entryModules: d.EntryModule[]) {
  if (buildCtx.hasError || !buildCtx.isActiveBuild) {
    return null;
  }

  if (buildCtx.isRebuild && !buildCtx.requiresFullBuild && !buildCtx.hasScriptChanges && compilerCtx.lastRawModules) {
    // this is a rebuild, it doesn't require a full build
    // there were no script changes, and we've got a good cache of the last js modules
    // let's skip this
    buildCtx.debug(`generateModuleMap, using lastRawModules cache`);
    return compilerCtx.lastRawModules;
  }

  const moduleMapTimespan = buildCtx.createTimeSpan(`module map started`);
  let moduleFormats: d.JSModuleFormats;

  try {
    moduleFormats = await generateBundleModules(config, compilerCtx, buildCtx, entryModules);

  } catch (e) {
    catchError(buildCtx.diagnostics, e);
  }

  const moduleDeriveTimespan = buildCtx.createTimeSpan(`module derive started`, true);
  const derivesModules = await deriveModules(config, compilerCtx, buildCtx, moduleFormats);
  moduleDeriveTimespan.finish(`module derive finished`);

  // remember for next time incase we change just a css file or something
  compilerCtx.lastRawModules = derivesModules;

  moduleMapTimespan.finish(`module map finished`);

  return derivesModules;
}
