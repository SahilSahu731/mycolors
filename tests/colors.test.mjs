import assert from 'node:assert/strict';
import { test } from 'node:test';
import {contrast,accessible,hsl,fromHsl,normalize,harmony,ink} from '../src/lib/colors.ts';
test('WCAG reference contrast ratios',()=>{
 assert.equal(contrast('#000000','#ffffff'),21);
 assert.equal(contrast('#778899','#778899'),1);
 assert.ok(Math.abs(contrast('#ff0000','#ffffff')-3.99847677)<0.000001);
});
test('HEX input is validated and normalized',()=>{
 assert.equal(normalize('#abc'),'#aabbcc');
 assert.equal(normalize(' FF00AA '),'#ff00aa');
 assert.equal(normalize('bad-color'),null);
});
test('HSL round trips and generated colors are valid',()=>{
 for(const c of ['#ff0000','#00ff00','#0000ff','#d9f279','#171916','#ffffff','#000000']) {
  assert.equal(fromHsl(...hsl(c)),c);
  for(const mode of ['Analogous','Triadic','Complementary']) assert.ok(harmony(c,mode).every(x=>normalize(x)));
 }
});
test('text color selection and suggested repairs meet AA normal text',()=>{
 for(let i=0;i<360;i+=7){
  const c=fromHsl(i,65,50);
  assert.ok(contrast(c,ink(c))>=4.5);
  for(const bg of ['#f3f4ed','#111410','#ffffff','#000000','#779d70']) assert.ok(contrast(accessible(c,bg),bg)>=4.5);
 }
});
