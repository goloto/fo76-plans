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
    const filteredStringElements: Element[] = [];
    const edidArray: string[] = [];

    stringsElementArray.forEach((element) => {
      const containBook = element.innerHTML.indexOf('BOOK:FULL') !== -1;

      if (containBook) {
        filteredStringElements.push(element.querySelector('EDID') as Element);
      }
    })

    filteredStringElements.forEach((element) => {
      const edid = element.innerHTML;
      const isSleeping = edid.indexOf('zzz') !== -1;
      const isNonPlayable = edid.indexOf('NONPLAYABLE') !== -1;

      if (!isSleeping && !isNonPlayable){
        edidArray.push(element.innerHTML)
      }
    });

    if (edidArray.length > 0) {
      const edidString = edidArray.map((edid) => `"edid|${edid}",\n`);
      const formattedFileName = fileName.replace('_en.xml', '');
  
      Bun.write(`./formId/${formattedFileName}.txt`, edidString);
    }
  });
}

await extractFormId();