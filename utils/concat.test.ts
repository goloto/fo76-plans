import { expect, test, describe, beforeAll } from 'bun:test';
import { JSDOM } from 'jsdom';

let EN_ALL = '';
let RU_ALL = '';

beforeAll(async () => {
  EN_ALL = await Bun.file('./xml/en/_All.xml').text();
  RU_ALL = await Bun.file('./xml/ru/_All.xml').text();
});

describe('Testing concat', () => {
  test('Strings count in english version should be equal to russian version', () => {
    const enLength = new JSDOM(EN_ALL).window.document.querySelector('Content')?.childNodes.length || 0;
    const ruLength = new JSDOM(RU_ALL).window.document.querySelector('Content')?.childNodes.length || 0;

    expect(enLength).toEqual(ruLength);
  });

  test('String id\'s in english version should be equal to id\'s in russian version', () => {
    const enContent = new JSDOM(EN_ALL).window.document.querySelector('Content');
    const ruContent = new JSDOM(RU_ALL).window.document.querySelector('Content');
    const enIds = getIdsFromContent(enContent?.children);
    const ruIds = getIdsFromContent(ruContent?.children);

    expect(enIds.sort()).toEqual(ruIds.sort());
  });
});

const getIdsFromContent = (nodes?: HTMLCollection): string[] => {
  if (!nodes) {
    return []
  }

  const result: string[] = [];

  for (const node of nodes) {
    const id = node.getAttribute('sID');

    if (!id) {
      continue;
    }

    result.push(id);
  }


  return result;
}