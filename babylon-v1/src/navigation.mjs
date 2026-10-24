// Planification A* sur une grille 2D ; obstacle rectangulaire + marge du personnage.
// Le monde peut ensuite être migré vers Recast/NavMesh sans modifier les commandes d'exploration.
export class WalkGrid {
  constructor({minX=-19,maxX=19,minZ=-11.3,maxZ=10.6,step=.55,radius=.35,blocks=[]}={}){
    Object.assign(this,{minX,maxX,minZ,maxZ,step,radius,blocks});
    this.width=Math.floor((maxX-minX)/step)+1;this.height=Math.floor((maxZ-minZ)/step)+1;
  }
  inBounds(x,z){return x>=this.minX&&x<=this.maxX&&z>=this.minZ&&z<=this.maxZ;}
  free(x,z){return this.inBounds(x,z)&&!this.blocks.some(b=>x>=b.x0-this.radius&&x<=b.x1+this.radius&&z>=b.z0-this.radius&&z<=b.z1+this.radius);}
  toCell(x,z){return {i:Math.max(0,Math.min(this.width-1,Math.round((x-this.minX)/this.step))),j:Math.max(0,Math.min(this.height-1,Math.round((z-this.minZ)/this.step)))};}
  toWorld(i,j){return {x:this.minX+i*this.step,z:this.minZ+j*this.step};}
  cellFree(i,j){if(i<0||j<0||i>=this.width||j>=this.height)return false;const p=this.toWorld(i,j);return this.free(p.x,p.z);}
  nearest(x,z){const c=this.toCell(x,z);if(this.cellFree(c.i,c.j))return c;for(let r=1;r<Math.max(this.width,this.height);r++)for(let di=-r;di<=r;di++)for(let dj=-r;dj<=r;dj++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(this.cellFree(c.i+di,c.j+dj))return {i:c.i+di,j:c.j+dj};}return null;}
  path(from,to){const start=this.nearest(from.x,from.z),finish=this.nearest(to.x,to.z);if(!start||!finish)return [];
    const key=(i,j)=>j*this.width+i, first=key(start.i,start.j),last=key(finish.i,finish.j);
    const frontier=[{i:start.i,j:start.j,g:0,f:0}], best=new Map([[first,0]]), parents=new Map(),visited=new Set();
    const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    while(frontier.length){let m=0;for(let k=1;k<frontier.length;k++)if(frontier[k].f<frontier[m].f)m=k;const cur=frontier.splice(m,1)[0],ck=key(cur.i,cur.j);if(visited.has(ck))continue;visited.add(ck);if(ck===last){const points=[];let k=last;while(k!==first){const i=k%this.width,j=Math.floor(k/this.width);points.push(this.toWorld(i,j));k=parents.get(k);if(k===undefined)return [];}return points.reverse();}
      for(const [di,dj] of dirs){const ni=cur.i+di,nj=cur.j+dj;if(!this.cellFree(ni,nj))continue;if(di&&dj&&(!this.cellFree(cur.i+di,cur.j)||!this.cellFree(cur.i,cur.j+dj)))continue;
        const nk=key(ni,nj),ng=cur.g+(di&&dj?Math.SQRT2:1);if(ng>=(best.get(nk)??Infinity))continue;best.set(nk,ng);parents.set(nk,ck);frontier.push({i:ni,j:nj,g:ng,f:ng+Math.hypot(finish.i-ni,finish.j-nj)});}
    }return [];
  }
}