import { JSDOM } from 'jsdom';

const translateFile = async (path: string, originalTag: string, translatedTag: string) => {
  const file = Bun.file(path);
  const fileContent = await file.text();
  const dom = new JSDOM(fileContent, {contentType: 'text/xml'});
  const stringsElementArray = dom?.window?.document?.querySelectorAll('String');

  for (const stringElement of stringsElementArray) {
    const source = stringElement.querySelector('Source');
    const dest = stringElement.querySelector('Dest');
    const prefix = dest?.textContent?.split('|')[0].replace(originalTag, translatedTag);

    if (source === null) {
      throw new Error('<Source> element not found!');
    }

    if (dest === null) {
      throw new Error('<Dest> element not found!');
    }

    dest.innerHTML = `${prefix}|${source?.textContent}`;
  }

  Bun.write(path, dom.serialize());
}

await translateFile('./xml/ru/Gleaming_Depths_ru.xml', 'DEPTHS', 'ГЛУБИНЫ')