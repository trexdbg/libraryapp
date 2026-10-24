import test from 'node:test';
import assert from 'node:assert/strict';
import {WalkGrid} from '../src/navigation.mjs';
const grid=new WalkGrid({minX:-5,maxX:5,minZ:-5,maxZ:5,step:.5,blocks:[{x0:-1,x1:1,z0:-1,z1:1}]});
test('blocks enforce character radius',()=>{assert.equal(grid.free(0,0),false);assert.equal(grid.free(1.2,0),false);assert.equal(grid.free(3,3),true);});
test('A* navigates around shelves without crossing blocked cells',()=>{const path=grid.path({x:-3,z:0},{x:3,z:0});assert.ok(path.length>0);assert.ok(path.every(p=>grid.free(p.x,p.z)));assert.ok(path.some(p=>Math.abs(p.z)>1.35));});
test('out-of-bounds destination snaps to accessible cell',()=>{const path=grid.path({x:0,z:-3},{x:50,z:50});assert.ok(path.length>0);assert.ok(path.every(p=>grid.free(p.x,p.z)));});
test('diagonal corner cutting is forbidden',()=>{const g=new WalkGrid({minX:0,maxX:2,minZ:0,maxZ:2,step:1,radius:0,blocks:[{x0:.9,x1:1.1,z0:-.1,z1:.1},{x0:-.1,x1:.1,z0:.9,z1:1.1}]});assert.deepEqual(g.path({x:0,z:0},{x:1,z:1}),[]);});