const env = require('jsdoc/env')
const fs = require('jsdoc/fs');
const helper = require('jsdoc/util/templateHelper')
const jsdPath = require(`jsdoc/path`);
const linkTo = helper.linkto;
const htmlSafe = helper.htmlsafe;
const resolveAuthorLinks = helper.resolveAuthorLinks;
const getAncestorLinks = helper.getAncestorLinks;

const taffy = require('taffydb').taffy
const template = require('jsdoc/template');

const path = require('path');



let data;
let view;
let outdir = path.normalize(env.opts.destination);

const find = (spec) => helper.find(data, spec);

const hashToLink = (doclet, hash) => {
  if (!/^(#.+)/.test(hash))
    return hash;

  const url = helper.createLink(doclet).replace(/(#.+|$)/, hash);
  return `<a href="${url}">${hash}</a>`;
}

const span = (content = ``, ...classes) => `<span class="${classes.join(` `)}">${content}</span>`;
const li = (content = ``) => `<li>${content}</li>`;

const isDefined = (value) => value !== undefined && value !== null;

/**
 * Returns truthy if the path to the object exists
 * @param o {object} source
 * @param path {string} path
 * @param getValue [any] return the value instead of boolean, use this value if path is undefined
 * @example
 * const Hello = {World: { Foo: { Bar: 'Baz'}}};
 * console.log(objectPathExists(Hello, 'World.Foo.Bar')) // true
 * console.log(objectPathExists(Hello, 'World.Foo.Bar', true)) // Baz
 * console.log(objectPathExists(Hello, 'World.Foo', true)) // {Bar: 'Baz'}
 * console.log(objectPathExists(Hello, 'World.FooBar', {})) // {}
 * @return {any}
 */
const chain = (o, path, getValue) => {
  if (!o || !Object.keys(o).length) return false;
  const keys = path.split('.');
  const loop = () => keys.every((k) => (o = o[k], isDefined(o)));
  const passFail = loop();
  return getValue === undefined ? passFail : passFail && o !== undefined ? o : getValue;
}

/**
 *
 * @param kind {'typedef'|'namespace'|'function'|'class'}
 * @param type {{names: string[]}}
 * @param meta {{code:{type: any}}}
 * @return {boolean}
 */
const needsSignature = ({kind, type, meta}) => {
  if (kind === "class" || kind === "function")
    return true;

  if (kind === "typedef" && chain(type,`names.length`, true) && type.names.find(s => s.toLowerCase() === 'function'))
    return true;

  return !!(kind === "namespace" && chain(meta, `code.type`, true).match(/[Ff]unction/))
}

/**
 * @param optional {boolean}
 * @param nullable? {boolean}
 * @return string[]
 */
const getSignatureAttributes = ({optional, nullable}) => {
  return [
    ...nullable === true ? ['nullable'] : nullable === false ? ['non-null'] : [],
    ...optional ? ['opt'] : [],
  ]
}

/**
 * @param item {{variable: boolean; name: string; optional: boolean; nullable?: boolean}}
 * @return string;
 */
const updateItemName = (item) => {
  const attributes = getSignatureAttributes(item);
  let itemName = item.name;

  if (item.variable)
    itemName = `&hellip;${itemName}`;

  if (attributes.length)
    itemName += span(attributes.join, `signature-attributes`);

  return itemName;
}

/**
 * @param params {{variable: boolean; name: string; optional: boolean; nullable?: boolean}[]}
 * @return <{variable: boolean; name: string; optional: boolean; nullable?: boolean}[]>
 */
const addParamAttributes = (params) =>
  params.filter(({name}) => !(name || ``).includes(`.`)).map(updateItemName);

const buildItemTypeStrings = (item) =>
  chain(item, `type.names`, []).map(name => linkTo(name, htmlSafe(name))) || [];

const buildAttribsString = (attribs) =>
  (attribs || []).length && span(htmlSafe(`(${attribs.join(`, `)})`)) || ``;

const addNonParamAttributes = (items) => items.map(item => buildItemTypeStrings(item));

const addSignatureParams = (f) => f.signature = `${f.signature || ``}(${addParamAttributes(f.params || [])})`;

const addSignatureReturns = (f) => {
  let attribsString = ``;
  let returnTypes = [];
  let returnTypeString = ``;
  const attribs = [];
  const source = f.yields || f.returns;

  (source || []).forEach(item => {
    helper.getAttribs(item).forEach(attrib => {
      if (!attribs.includes(attrib))
        attribs.push(attrib);
    })
  })

  returnTypes = addNonParamAttributes(source || []);
  returnTypeString = returnTypes.length && ` &rarr; ${attribsString}{${returnTypes.join(`|`)}}` || ``;


  f.signature = span(f.signature, `signature`).concat(span(returnTypeString, `type-signature`));
}

const addSignatureTypes = (f) => {
  const types = (f.type ? buildItemTypeStrings(f) : []).join(`|`);
  f.signature = (f.signature || ``).concat(span(types.length && ` :${types}`, `type-signature`));
}

const addAttribs = (f) => f.attribs = span(buildAttribsString(helper.getAttribs(f)), `attributes`);

const shortenPaths = (files, commonPrefix) => {
  Object.keys(files).forEach(file => {
    files[file].shortened = files[file].resolved.replace(commonPrefix, '').replace(/\\/g, '/')
  });
  return files;
}

const getPathFromDoclet = ({meta}) =>
  !meta ? null : meta.path !== null && path.join(meta.path, meta.filename) || meta.filename;

const generate = (title, subtitle, docs, filename, resolveLinks = true) => {

  const docData = {env, title, docs,};
  const outPath = path.join(outdir, filename);

  let html = view.render('container.tmpl', docData);

  if (resolveLinks)
    html = helper.resolveLinks(html);

  fs.writeFileSync(outPath, html, 'utf8');
}

const generateSourceFiles = (sourceFiles, encoding = 'utf8') => {
  Object.keys(sourceFiles).forEach(key => {
    let source;
    const file = sourceFiles[key];
    const sourceOutFile = helper.getUniqueFilename(file.shortened);
    helper.registerLink(file.shortened, sourceOutFile);

    try {
      source = {kind: 'source', code: helper.htmlsafe(fs.readFileSync(file.resolved, encoding))}
    } catch (e) {
      console.error(`Error while generating source file ${key}: ${e.message}`);
    }

    generate(`Source: ${file.shortened}`, `Source`, [source], sourceOutFile, false);
  });
}

const attachModuleSymbols = (doclets, modules) => {
  const symbols = {};

  doclets.forEach(symbol => {
    if (!symbols[symbol.longname])
      symbols[symbol.longname] = [];
    symbols[symbol.longname].push(symbol);
  });

  modules.forEach(module => {
    if (symbols[module.longname])
      module.modules =
        symbols[module.longname]
          .filter(({description, kind}) => description || kind === `class`)
          .map(symbol => {
            symbol = {...symbol};
            if ([`class`, `function`].includes(symbol.kind))
              symbol.name = `${symbol.name.replace('module:', 'require("')}"))`
            return symbol;
          })

  })
}

const buildMemberNav = (items, itemHeading, itemsSeen, linkToFn) => {
  const subCategories = {};

  for (const item of items) {
    const subCategory = item.subCategory || ``;
    if (!subCategories[subCategory])
      subCategories[subCategory] = [];

    subCategories[subCategory].push(item)
  }

  let navs = ``;

  const displayName = (item) => (chain(env, `conf.templates.default.useLongNameInNav`, false) ? item.longname : item.name)
    .replace(/\b(module|event):/g, '');

  for (const subCategory of Object.keys(subCategories)) {
    const subCategoryItems = subCategories[subCategory];
    let itemsNav = ``;
    for (const item of subCategoryItems) {
      if (!(item || {}).hasOwnProperty(`longname`))
        itemsNav += li(linkToFn(``, item.name))
      else if (!itemsSeen.hasOwnProperty(item.longname)) {

        itemsNav += `<li>${linkToFn(item.longname, displayName(item))}`

        if ((item.children || []).length) {
          itemsNav += `<ul>`
          items.children.forEach(child =>
            itemsNav += li(linkToFn(child.longname, displayName(child))));

          itemsNav += `</ul>`
        }

        itemsNav += `</li>`

        itemsSeen[item.longname] = true;
      }
    }

    if (itemsNav.length)
      navs += `<h3>${itemHeading} ${subCategory ? `/ ` + subCategory : ``}</h3><ul>${itemsNav}</ul>`;
  }

  return navs;
}

const linktoExternal = (longName, name) => linkTo(longName, name.replace(/(^"|"$)/g, ''))

const buildGroupNav = (members, title) => {
  let globalNav = ``;

  const seenTutorials = {};
  const seen = {};

  let nav = `<div class="category">`;
  if (title)
    nav += `<h2>${title}</h2>`;

   const memberNav = [
    [members.tutorials || [], `Tutorials`, seenTutorials, linktoExternal],
    [members.modules || [], `Modules`, seen, linkTo],
    [members.externals || [], `Externals`, seen, linktoExternal],
    [members.namespaces || [], `Namespaces`, seen, linkTo],
    [members.classes || [], `Classes`, seen, linkTo],
    [members.interfaces || [], `Interfaces`, seen, linkTo],
    [members.events || [], `Events`, seen, linkTo],
    [members.mixins || [], `Mixins`, seen, linkTo],
    [members.functions || [], `Functions`, seen, linkTo],
  ].map(([items, heading, seen, link]) => buildMemberNav(items, heading, seen, link))
    .join(``);

  nav += memberNav;

  (members.globals || []).forEach(({kind, longname, name}) => {
    if (kind !== `typedef` && !seen[longname])
      globalNav += li(linkTo(longname, name));

    seen[longname] = true;
  });

  if (!globalNav)
    nav += `<h3>${linkTo(`global`, `Global`)}</h3>`
  else nav += `<h3>Global</h3><ul>${globalNav}</ul>`;

  nav += `</div>`;

  return nav;
}

const DEFAULT_CONF = {
  useDocsAsLanding: false,
  showSmallHeader: false,
}

const buildNav = (members, navTypes = null, conf = DEFAULT_CONF) => {
  const href = conf.useDocsAsLanding ? `docs.html` : `index.html`;
  let nav = !navTypes ? `<h2><a href="${href}">Documentation</a></h2>` : ``;

  const categorised = {};
  const root = {};

  (navTypes || [`modules`, `externals`, `namespaces`, `classes`, `interfaces`, `events`, `mixins`, `globals`])
    .forEach(type => {
      if (!members[type])
        return;
      members[type].forEach(el => {
        if (el.access === `private`)
          return;
        const category = el.category;
        if (category) {
          if (!categorised[category])
            categorised[category] = [];

          if (!categorised[category][type])
            categorised[category][type] = [el];
          else categorised[category][type].push(el);

        } else {
          if (!root[type])
            root[type] = [el]
          else root[type].push(el);
        }
      })
    });

  nav += buildGroupNav(root, `Main`);

  Object.keys(categorised).sort().forEach(category => {
    nav += buildGroupNav(categorised[category], category);
  });

  return nav;
}
exports.publish = (taffyData, opts, tutorials) => {
  let classes, externals, interfaces, members, mixins, modules, namespaces;
  let files, fromDir, globalUrl, indexUrl;
  let packageInfo, packages;
  let staticFileFilter, staticFilePaths, staticFiles, staticFileScanner, templatePath, outputSourceFiles;

  const sourceFilePaths = [];
  let sourceFiles = {};

  const conf = env.conf.templates || {};
  conf.default = conf.default || {};
  conf.bepro = conf.bepro || DEFAULT_CONF;

  templatePath = path.normalize(opts.template);
  view = new template.Template(path.join(templatePath, `tmpl`));

  indexUrl = helper.getUniqueFilename('index');
  globalUrl = helper.getUniqueFilename('global');
  helper.registerLink(`global`, globalUrl);

  const layoutFile = conf.default.layoutFile;
  view.layout = conf.default.layoutFile && path.getResourcePath(path.dirname(layoutFile), path.basename(layoutFile)) || `layout.tmpl`;

  helper.setTutorials(tutorials);

  data = taffyData;

  data = helper.prune(data);
  data.sort(`longname, version, since`);
  helper.addEventListeners(data);

  data().each(doclet => {
    let sourcePath = ``;

    doclet.attribs = ``;

    if (doclet.examples) {
      doclet.examples = doclet.examples.map(example => {
        let caption = ``;
        let code = ``;

        if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
          caption = RegExp.$1;
          code = RegExp.$3;
        }

        return {caption, code};
      });
    }

    if (doclet.see)
      doclet.see.forEach((see, i) =>
        doclet.see[i] = hashToLink(doclet, see));

    if (doclet.meta) {
      sourcePath = getPathFromDoclet(doclet);
      sourceFiles[sourcePath] = {
        resolved: sourcePath, shortened: null,
      }

      if (!sourceFilePaths.includes(sourcePath))
        sourceFilePaths.push(sourcePath);
    }

  });

  packageInfo = (find({kind: `package`}) || [])[0];
  if ((packageInfo || {}).name)
    outdir = path.join(outdir, packageInfo.name, /* packageInfo.version || */``);

  fs.mkPath(outdir);

  fromDir = path.join(templatePath, `static`);
  staticFiles = fs.ls(fromDir, 3);

  staticFiles.forEach(filename => {
    const toDir = fs.toDir(filename.replace(fromDir, outdir));
    fs.mkPath(toDir);
    fs.copyFileSync(filename, toDir);
  });

  if (conf.default.staticFiles) {
    staticFilePaths = (chain(conf, `default.staticFiles.include`, false) || chain(conf, `default.staticFiles.paths`, false) || []).map(filePath => path.resolve(env.pwd, filePath));
    staticFileFilter = new (require(`jsdoc/src/filter`)).Filter(conf.default.staticFiles)
    staticFileScanner = new (require(`jsdoc/src/scanner`)).Scanner();

    staticFilePaths.forEach(filePath =>
      staticFileScanner.scan([filePath, 10, staticFileFilter]).forEach(extraFile => {
        const toDir = fs.toDir(extraFile.replace(fs.toDir(filePath), outdir));
        fs.mkPath(toDir);
        fs.copyFileSync(extraFile, toDir);
      })
    )
  }

  if (sourceFilePaths.length)
    sourceFiles = shortenPaths(sourceFiles, jsdPath.commonPrefix(sourceFilePaths));

  data().each(doclet => {
    helper.registerLink(doclet.longname, helper.createLink(doclet));

    if (doclet.meta) {
      const docletPath = chain(sourceFiles[getPathFromDoclet(doclet)], `shortened`, ``);
      if (docletPath)
        doclet.meta.shortpath = docletPath;
    }

    const docletUrl = helper.longnameToUrl[doclet.longname];
    if (docletUrl.includes(`#`))
      doclet.id = docletUrl.split(`#`).pop();
    else doclet.id = doclet.name;

    const signatures = [];

    if (needsSignature(doclet))
      signatures.push(addSignatureParams, addSignatureReturns, addAttribs,)

    doclet.ancestors = getAncestorLinks(doclet);
    if (doclet.kind === `member` || doclet.kind === `constant`)
      signatures.push(addSignatureTypes, addAttribs);

    signatures.forEach(sign => sign(doclet));

    if (doclet.kind === `constant`)
      doclet.kind = `member`

  });

  view.smallHeader = conf.bepro.showSmallHeader;

  members = helper.getMembers(data);

  if (!opts.tutorials)
    members.tutorials = tutorials.children;
  else {
    try {
      const tutorialsFile = JSON.parse(fs.readFileSync(`${opts.tutorials}/tutorials.json`, 'utf8'));
      members.tutorials = Object.keys(tutorialsFile).map(key => tutorials._tutorials[key]);
      view.smallHeader = false;
    } catch (e) {
      if (e.code !=='ENOENT')
        throw e;

      members.tutorials = tutorials.children;
    }
  }

  view.tutorials = members.tutorials;
  members.classes = helper.find(data, {kind: 'class',});

  outputSourceFiles = chain(conf, `default.outputSourceFiles`, false) !== false;

  view.find = find;
  view.linkto = helper.linkto;
  view.resolveAuthorLinks = resolveAuthorLinks;
  view.tutorialToUrl = helper.tutorialToUrl;
  // view.tutoriallink = resolveAuthorLinks;
  view.htmlsafe = htmlSafe;
  view.outputSourceFiles = outputSourceFiles;

  view.nav = buildNav(members, null, conf.bepro);
  // view.tutorialsNav = buildNav(members, ['tutorials'], conf.bepro);

  attachModuleSymbols( find({ longname: {left: 'module:'} }), members.modules )
  if (outputSourceFiles)
    generateSourceFiles(sourceFiles, opts.encoding);

  if (members.globals.length)
    generate('Global', ``, [{kind: 'globalobj'}], globalUrl);

  files = find({kind: 'file'});
  packages = find({kind: 'package'});

  generate(chain(conf, `bepro.name`, `Documentation Home`), ``,
    packages.concat(
      [{
        kind: `mainpage`,
        readme: opts.readme,
        longname: conf.bepro.name || `Main Page`
      }]
    ).concat(files), indexUrl);

  classes = taffy(members.classes);
  modules = taffy(members.modules);
  namespaces = taffy(members.namespaces);
  mixins = taffy(members.mixins);
  externals = taffy(members.externals);
  interfaces = taffy(members.interfaces);

  Object.keys(helper.longnameToUrl).forEach(longname =>
    [
      [classes, `Classes`],
      [externals, `Externals`],
      [interfaces, `Interfaces`],
      [mixins, `Mixins`],
      [modules, `Modules`],
      [namespaces, `Namespaces`]
    ]
      .forEach(([type, heading]) => {
        const generator = helper.find(type, {longname});
        if (generator.length) {
          generate(generator[0].name, heading, generator, helper.longnameToUrl[longname]);
        }


      })
  );

}
