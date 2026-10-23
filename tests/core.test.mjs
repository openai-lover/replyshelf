import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateEntries,seed,rank,verdict,lexicalRank,dot} from '../dist/core.js';
test('exports round-trip without trusting extra fields',()=>{const copy=validateEntries({entries:seed.map(x=>({...x,html:'unsafe'}))});assert.deepEqual(copy,seed);});
test('reject invalid, duplicate, oversized and blank data',()=>{for(const x of [null,{},[...seed,seed[0]],[{...seed[0],answer:' '}],[{...seed[0],question:'a'.repeat(501)}],Array(101).fill(seed[0])])assert.throws(()=>validateEntries(x));});
test('empty shelves remain empty on reload',()=>assert.deepEqual(validateEntries([]),[]));
test('rank maps each embedding to its own stable entry id',()=>{assert.deepEqual(rank([1,0],[[0,1],[1,0]],[{id:'a'},{id:'b'}]),[{id:'b',score:1},{id:'a',score:0}]);});
test('weak and ambiguous matches do not masquerade as certain',()=>{assert.equal(verdict([]),'weak');assert.equal(verdict([{score:.419}]),'weak');assert.equal(verdict([{score:.62},{score:.59}]),'ambiguous');assert.equal(verdict([{score:.62},{score:.4}]),'match');});
test('dimension mismatch fails instead of producing NaN',()=>assert.throws(()=>dot([1],[1,0])));
test('lexical baseline returns reproducible ties in shelf order',()=>{assert.equal(lexicalRank('zzzz',seed)[0].id,'refund');assert.equal(lexicalRank(seed[3].question,seed)[0].id,'password');});
