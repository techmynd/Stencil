import * as d from '../../declarations';
import { normalizePrerenderLocation } from '../prerender/prerender-utils';


export function getFilePathFromUrl(config: d.Config, outputTarget: d.OutputTargetHydrate, windowLocationHref: string, url: string) {
  if (typeof url !== 'string' || url.trim() === '') {
    return null;
  }

  const location = normalizePrerenderLocation(config, outputTarget, windowLocationHref, url);
  if (!location) {
    return null;
  }

  return config.sys.path.join(outputTarget.dir, location.path);
}


export function createHashedFileName(fileName: string, hash: string) {
  const parts = fileName.split('.');
  parts.splice(parts.length - 1, 0, hash);
  return parts.join('.');
}
