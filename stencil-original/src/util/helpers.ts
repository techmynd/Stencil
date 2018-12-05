
export const isDef = (v: any) => v != null;

export const toLowerCase = (str: string) => str.toLowerCase();

export const toDashCase = (str: string) => toLowerCase(str.replace(/([A-Z0-9])/g, g => ' ' + g[0]).trim().replace(/ /g, '-'));

export const dashToPascalCase = (str: string) => toLowerCase(str).split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');

export const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.substr(1);

export const captializeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const noop = (): any => { /* noop*/ };

export const pluck = (obj: {[key: string]: any }, keys: string[]) => {
  return keys.reduce((final, key) => {
    if (obj[key]) {
      final[key] = obj[key];
    }
    return final;
  }, {} as {[key: string]: any});
};

export const isObject = (val: Object) => {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};
