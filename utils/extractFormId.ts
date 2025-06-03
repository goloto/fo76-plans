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
    const edidObj = {
      'armor': <string[]>[],
      'armor+': <string[]>[],
      'armor++': <string[]>[],
      'armor+++': <string[]>[],
      'plan': <string[]>[],
      'plan+': <string[]>[],
      'plan++': <string[]>[],
      'plan+++': <string[]>[],
    }

    stringsElementArray.forEach((element) => {
      const isBook = element.innerHTML.indexOf('BOOK:FULL') !== -1;
      const isArmor = element.innerHTML.indexOf('ARMO:FULL') !== -1;
      const isRareThree = element.innerHTML.indexOf('+++|') !== -1;
      const isRareTwo = element.innerHTML.indexOf('++|') !== -1;
      const isRareOne = element.innerHTML.indexOf('+|') !== -1;

      const edidElement = element.querySelector('EDID') as Element;
      const edid = edidElement.innerHTML;
      const isSleeping = edid.indexOf('zzz') !== -1;
      const isNonPlayable = edid.indexOf('NONPLAYABLE') !== -1;

      if (isSleeping || isNonPlayable){
        return;
      }

      if (isBook && isRareThree) {
        edidObj['plan+++'].push(edid);

        return;
      }

      if (isArmor && isRareThree) {
        edidObj['armor+++'].push(edid);

        return;
      }

      if (isBook && isRareTwo) {
        edidObj['plan++'].push(edid);

        return;
      }

      if (isArmor && isRareTwo) {
        edidObj['armor++'].push(edid);

        return;
      }

      if (isBook && isRareOne) {
        edidObj['plan+'].push(edid);

        return;
      }

      if (isArmor && isRareOne) {
        edidObj['armor+'].push(edid);

        return;
      }

      if (isBook) {
        edidObj.plan.push(edid);

        return;
      }

      if (isArmor) {
        edidObj.armor.push(edid);

        return;
      }
    });

    let edidString = '';
    const formattedFileName = fileName.replace('_en.xml', '');

    Object.entries(edidObj).forEach(([key, edidArray]) => {
      if (edidArray.length > 0) {
        edidString = `${edidString}${key}:\n${edidArray.map((edid) => `"edid|${edid}",\n`).join('')}`;
      }
    });

    Bun.write(`./formId/${formattedFileName}.txt`, edidString);
  });
}

await extractFormId();