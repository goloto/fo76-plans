import { readdir } from "node:fs/promises";
import { JSDOM } from 'jsdom';

const extractFormId = async () => {
  const source = './xml/en';
  const EN_FILES = await readdir(source);

  EN_FILES.forEach(async (fileName) => {
    if (fileName.includes('_All')) {
      return;
    }
    
    const file = Bun.file(`${source}/${fileName}`);
    const string = await file.text();
    const dom = new JSDOM(string, {contentType: 'text/xml'});
    const stringsElementArray = dom?.window?.document?.querySelectorAll('String');
    const filteredStrings: Element[] = [];
    const edidArray: string[] = [];

    stringsElementArray.forEach((element) => {
      const containBook = element.innerHTML.indexOf('BOOK:FULL') !== -1;

      if (containBook) {
        filteredStrings.push(element.querySelector('EDID') as Element);
      }
    })

    filteredStrings.forEach((element) => edidArray.push(element.innerHTML));

    if (edidArray.length > 0) {
      const edidString = edidArray.map((edid) => `${edid},\n`);
      const formattedFileName = fileName.replace('_en.xml', '');
  
      Bun.write(`./formId/${formattedFileName}.txt`, edidString);
    }
  });
}

await extractFormId();