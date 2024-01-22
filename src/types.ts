import { type VersionBumpOptions } from "bumpp";
import { BuildOptions } from "esbuild";

export interface ConfigBase {
  /**
   * The source code directories.
   *
   * Can be multiple directories, and changes to these directories will be watched when `server` is running.
   *
   * 源码目录。
   *
   * 可以是多个目录，将在 `server` 运行时监听这些目录的变更。
   *
   * @default ["src"]
   */
  source?: string[];
  /**
   * The build directories.
   *
   * Scaffold will store the code before packaging after the build at `${dist}/addon`.
   * Store the packaging results at `${dist}/${package_json.name}.xpi`.
   *
   * 构建目录。
   *
   * 脚手架将在 `${dist}/addon` 存放构建后打包前的代码。
   * 在 `${dist}/${package_json.name}.xpi` 存放打包结果。
   *
   * @default "build"
   */
  dist?: string;
  /**
   * glob list of static assets
   *
   * 静态资源文件。
   *
   * - 通常包括图标、ftl 文件、第三方 JavaScript 文件、CSS 文件、XHTML 文件等。
   * - 是一个 `glob` 模式数组，支持否定模式。
   * - 除非一个目录没有需要排除的文件，否则不要添加整个目录。
   *
   * @see {@link https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax | Pattern syntax | 语法说明 }
   *
   * @default `["src/**\/*.*", "!src/**\/*.ts"]` (no `\`)
   */
  assets?: string[];
  /**
   * placeholders to replace in static assets
   *
   * 静态资源文本占位符。
   *
   * - 在构建时，脚手架使用占位符的 key 建立正则模式 `/__${key}__/g`，并将匹配到的内容替换为 `value`。
   * - 以下是一些预置的占位符，你可以在这里覆盖它们：
   *   - `name`, `description`, `version`, `homepage`, `author` 从 `package.json` 读取。
   *   - `__buildTime__` 为 `build.run` 调用时间。
   *   - `addonName`, `addonID`, `addonRef`, `addonInstense`, `prefsPrefix`, `releasePage`。
   * - 替换发生在 `dist/addon` 下的所有文件。
   */
  placeholders: {
    [key: string]: string | unknown;
    name?: string;
    description?: string;
    homepage?: string;
    buildVersion?: string;
    author?: string;
    addonName: string;
    addonID: string;
    addonRef: string;
    addonInstence?: string;
    prefsPrefix?: string;
    /**
     * 脚手架使用此项生成 update.json 链接和 xpi 链接
     *
     * @default `https://github.com/${owner}/${repo}/release`
     */
    releasePage?: string;
  };
  fluent?: {
    prefixLocaleFiles?: boolean;
    prefixFluentMessages?: boolean;
  };
  /**
   * The config of esbuild
   *
   * esbuild 配置
   *
   * 注意：
   * - 默认配置中 `source` 和 `dist` 会跟随用户配置.
   * - 此项配置会覆盖默认配置而不是在默认配置列表上新增.
   *
   * @default
   *
   * ```js
   * {
   *   entryPoints: [`${source}/index.ts`],
   *   define: {
   *     __env__: `"${env.NODE_ENV}"`,
   *   },
   *   bundle: true,
   *   target: "firefox102",
   *   outfile: `build/addon/${addonRef}.js`,
   *   minify: env.NODE_ENV === "production",
   * };
   * ```
   */
  esbuildOptions?: BuildOptions[];
  /**
   * Make manifest.json
   *
   */
  makeManifest?: {
    /**
     * 是否使用内置的模板 manifest.json。
     * 如果此项为 false，则开发者应自行准备 update.json
     */
    enable?: boolean;
    /**
     * template of manifest
     *
     * @default
     *
     * ```json
     * {
     *   manifest_version: 2,
     *   name: "__addonName__",
     *   version: "__buildVersion__",
     *   description: "__description__",
     *   homepage_url: "__homepage__",
     *   author: "__author__",
     *   icons: {
     *     "48": "content/icons/favicon@0.5x.png",
     *     "96": "content/icons/favicon.png",
     *   },
     *   applications: {
     *     zotero: {
     *       id: "__addonID__",
     *       update_url: "__updateURL__",
     *       strict_min_version: "6.999",
     *       strict_max_version: "7.0.*",
     *     },
     *     gecko: {
     *       id: "__addonID__",
     *       update_url: "__updateURL__",
     *       strict_min_version: "102",
     *     };
     *   };
     * };
     * ```
     */
    template?: Partial<Manifest>;
  };
  makeBootstrap?: boolean;
  makeUpdateJson?: {
    enable?: boolean | "only-production";
    // updateURL?: string;
    template?: UpdateJSON;
    tagName?: "release" | "updater" | string;
  };
  /**
   * The function called when build-in build resolved.
   *
   * Usually some extra build process.
   * All configurations will be parameterized to this function.
   *
   * 在默认构建步骤执行结束后执行的函数.
   *
   * 通常是一些额外的构建流程.
   * 所有的配置将作为参数传入此函数.
   */
  extraBuilder?: (options: Config) => any | Promise<any>;
  /**
   * The function called after Zotero started, before build-in watcher ready.
   */
  extraServer?: (options: Config) => any | Promise<any>;
  addonLint?: object;
  dotEnvPath?: string;
  release?: {
    releaseIt?: Partial<ReleaseItConfig>;
    bumpp?: VersionBumpOptions;
  };
  logLevel?: "trace" | "debug" | "info" | "warn" | "error";
}

export interface ConfigOptional extends Partial<ConfigBase> {}

export interface Config extends Required<ConfigBase> {
  cmd: {
    zoteroBinPath: string;
    profilePath: string;
    dataDir: string;
  };
  pkg: any;
}

interface Manifest {
  [key: string]: any;
  manifest_version: number;
  name: string;
  version: string;
  description?: string;
  homepage_url?: string;
  author?: string;
  icons?: Record<string, string>;
  applications: {
    zotero: {
      id: string;
      update_url: string;
      strict_min_version: string;
      strict_max_version?: string;
    };
    gecko: {
      id: string;
      update_url: string;
      strict_min_version: string;
    };
  };
}

/**
 * Update json
 * @see https://extensionworkshop.com/documentation/manage/updating-your-extension/
 */
interface UpdateJSON {
  addons: {
    [addonID: string]: {
      updates: Array<{
        version: string;
        update_link?: string;
        /**
         * A cryptographic hash of the file pointed to by `update_link`.
         * This must be provided if `update_link` is not a secure URL.
         * If present, this must be a string beginning with either `sha256:` or `sha512:`,
         * followed by the hexadecimal-encoded hash of the matching type.
         */
        update_hash?: string;
        applications: {
          zotero: {
            strict_min_version: string;
          };
          [application: string]: {
            strict_min_version?: string;
            strict_max_version?: string;
          };
        };
      }>;
    };
  };
}
