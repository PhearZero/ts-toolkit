import { join } from 'path'
import { readJson, writeJson } from './json'

// known sections except scripts, devDependencies, main, types and custom sections
// https://docs.npmjs.com/cli/v8/configuring-npm/package-json
export const standardSectionWhitelist = [
  'name',
  'version',
  'description',
  'keywords',
  'homepage',
  'bugs',
  'license',
  'author',
  'contributors',
  'funding',
  'files',
  'browser',
  'bin',
  'man',
  'directories',
  'repository',
  'config',
  'dependencies',
  'peerDependencies',
  'peerDependenciesMeta',
  'bundleDependencies',
  'optionalDependencies',
  'overrides',
  'engines',
  'os',
  'cpu',
  'private',
  'publishConfig',
]

type PackageEntryType = string | {[k: string]: any} | Array<any>
/**
 * Replace All Strings
 *
 * Takes an Object | Array and replaces all strings with the result of the replacer function
 *
 * @param {PackageEntryType} obj Any Object or Array
 * @param {Function} replacer Replacer function to run on each string
 */
function replaceAllStrings(obj: PackageEntryType, replacer: (key: string)=>string){
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if(typeof obj[i] === 'string'){
        obj[i] = replacer(obj[i])
      } else {
        obj[i] = replaceAllStrings(obj[i], replacer);
      }
    }
  }
  else if (typeof obj === "object") {
    for (const key in obj) {
      if(typeof obj[key] === 'string'){
        obj[key] = replacer(obj[key])
      } else {
        obj[key] = replaceAllStrings(obj[key], replacer)
      }
    }
  }
  return obj
}
export const copyPackageJson = (inputFolder: string, outputFolder: string, main: string, types: string, customSections: string[] = [], strip: string | undefined) => {
  const packageJson = readJson(join(inputFolder, 'package.json'))
  const sectionsToUse = [...standardSectionWhitelist, ...customSections]
  if(typeof strip === 'string'){
    if(typeof packageJson.main !== 'undefined'){
      packageJson.main = packageJson.main.replace(strip, '')
    }
    if(typeof packageJson.types !== 'undefined'){
      packageJson.types = packageJson.types.replace(strip, '')
    }
    if(typeof packageJson.module !== 'undefined'){
      packageJson.module = packageJson.module.replace(strip, '')
    }
    if(typeof packageJson.typesVersions !== 'undefined'){
      replaceAllStrings(packageJson.typesVersions, (str: string)=>{
        return str.replace(strip, '')
      })
    }
    if(typeof packageJson.exports !== 'undefined') {
     replaceAllStrings(packageJson.exports, (str: string)=>{
        return str.replace(strip, '')
      })
    }
  }

  const output = { main, types, ...pick(packageJson, ...sectionsToUse) }
  writeJson(join(outputFolder, 'package.json'), output)
  console.info(`✅ package.json written to: ${outputFolder}`)
}

/**
 * Creates an object composed of the picked `object` properties.
 */
const pick = <T extends object, U extends keyof T>(object: T, ...props: U[]): Partial<T> => {
  return Object.entries(object).reduce<Partial<T>>((acc, [key, value]) => {
    if (props.includes(key as U)) acc[key as U] = value
    return acc
  }, {})
}
