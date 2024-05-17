import { readdir } from "node:fs/promises";
import {JSDOM} from 'jsdom';

const EN_FILES = await readdir('./xml/en');
const RU_FILES = await readdir('./xml/ru');
const XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<SSTXMLRessources>
  <Params>
    <Addon>SeventySix</Addon>
    <Source>en</Source>
    <Dest>en</Dest>
    <Version>2</Version>
  </Params>
  <Content>
  </Content>
</SSTXMLRessources>
`;

const concatFiles = (directories: string[], destination: string) => {
  const xml = new JSDOM(XML_TEMPLATE, {contentType: 'text/xml'});

  directories.forEach(async (fileName) => {
    if (fileName.includes('_All')) {
      return;
    }

    const file = Bun.file(`${destination}${fileName}`);
    const string = await file.text();
    const dom = new JSDOM(string, {contentType: 'text/xml'});
    const content = dom?.window?.document?.querySelector('Content')?.children;

    if (!content) {
      return;
    }

    for (const contentChild of content) {
      xml.window?.document?.querySelector('Content')?.append(contentChild.cloneNode(true));
    };
  
    Bun.write(`${destination}_All.xml`, xml.serialize());
  });
}

concatFiles(EN_FILES, './xml/en/');
concatFiles(RU_FILES, './xml/ru/');

