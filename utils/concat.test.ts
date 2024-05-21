import { expect, test, describe, beforeAll } from 'bun:test';
import { JSDOM } from 'jsdom';

let EN_ALL = '';
let EN_DOM: JSDOM = new JSDOM();
let RU_ALL = '';
let RU_DOM: JSDOM = new JSDOM();

beforeAll(async () => {
  EN_ALL = await Bun.file('./xml/en/_All.xml').text();
  EN_DOM = new JSDOM(EN_ALL, {contentType: 'text/xml'});
  RU_ALL = await Bun.file('./xml/ru/_All.xml').text();
  RU_DOM = new JSDOM(RU_ALL, {contentType: 'text/xml'});
});

describe('Testing concat', () => {
  test('Strings count in english version should be equal to russian version', () => {
    const enLength = EN_DOM.window.document.querySelector('Content')?.childElementCount || 0;
    const ruLength = RU_DOM.window.document.querySelector('Content')?.childElementCount || 0;

    expect(enLength).toEqual(ruLength);
  });

  test('String id\'s in english version should be equal to id\'s in russian version', () => {
    const enContent = EN_DOM.window.document.querySelector('Content');
    const ruContent = RU_DOM.window.document.querySelector('Content');
    const enIds = getIdsFromContent(enContent?.children);
    const ruIds = getIdsFromContent(ruContent?.children);

    expect(enIds.sort()).toEqual(ruIds.sort());
  });
});

const getIdsFromContent = (nodes?: HTMLCollection): string[] => {
  if (!nodes) {
    return [];
  }

  const result: string[] = [];

  for (const node of nodes) {
    const id = node.getAttribute('sID');

    if (id) {
      result.push(id);
    }
  }

  return result;
}