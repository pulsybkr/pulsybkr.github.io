const hero= document.querySelector('.hero')
const jeu= document.querySelector('.jeu')
const enemy= document.querySelector('.enemy')
const feu= document.querySelector('.feu')
const feuE= document.querySelector('.feuE')
const nameleft = document.querySelector('.nameleft')
const nameright = document.querySelector('.nameright')
const level = document.querySelector('.level')
let niv = 0;
let x, y = 0;
let r = 0;
// fichier json **********************
var players = JSON.parse(players);
var enemies = JSON.parse(enemies);


while(niv<9){
  console.log(niv)
  
  function Game() {
    
  
    let heroStat = {
      id: players[0].id,
      name: players[0].name,
      hp: players[0].hp,
      str: players[0].str,
      spd: players[0].spd
    } 
    
    let enemyStat = {
      id: enemies[niv].id,
      name: enemies[niv].name,
      hp: enemies[niv].hp,
      str: enemies[niv].str,
      spd: enemies[niv].spd
    }
    
    let nameHero = heroStat.name;
    let VieHero = heroStat.hp;
    let ForcHero = heroStat.str;
    // let ForcHero = 20;
    
    let spdHero = heroStat.spd
    
    let nameEnemy = enemyStat.name;
    let VieEnemy = enemyStat.hp;
    
    let ForcEnemy = enemyStat.str;
    let spdEnemy = enemyStat.spd
    
    // console.log(enemyStat)
    // nom des personnages
    nameleft.innerHTML = nameHero;
    nameright.innerHTML = nameEnemy;
    
    // niveau
    function niveaudujeu(param) {
      if (param===1) {
      console.log( "le truc recuperer est", param)
      document.addEventListener("keydown", (e)=>{
        if (e.code==='Enter') {
        document.removeEventListener("keydown", ()=>{}, true)          
        }
        }, true)
      if (param>20) {
        VieEnemy = enemyStat.hp

      }
      }
    
      return VieEnemy
    }
    
    document.addEventListener('keydown', (e)=>{
      niveaudujeu(niv)
    
    // animation sur le deplacement du personnage *********
    // console.log(e)
    if(e.key === 'ArrowRight')
    {
      hero.classList.remove('leftdirection')
      hero.classList.add('animation')
      y+=5
      r+=5
    }
    
    // aller vers la gauche
    if (e.key === 'ArrowLeft') {
      hero.classList.add('animation')
      hero.classList.add('leftdirection')
      y-=5
      r+=5
    }
    hero.style.left = y+'px';
    
    // animation de l'attaque **********************
    document.documentElement.style.setProperty('--ecran', jeu.clientWidth + 'px')
    
    
    if (e.code === 'Space') {
    feuE.classList.add('animationfeuE')
    hero.classList.add('animationAttak')
    feu.classList.add('animationfeu')
    pointImpact()
    pointImpact2()
    console.log(VieHero)
    console.log(VieEnemy)
    
    let k = 0;
    while (VieEnemy>0 | VieHero>0) {
      // 
      if (VieEnemy <= 0) {
        level.classList.add('leveln')
        enemy.classList.add('animationGOe')
        
        document.removeEventListener("keydown", ()=>{}, true)
        k+=1;
        break
      } else if(VieHero <= 0){
        console.log('game over')
        hero.classList.add('animationGOh')
        k = 2;
        break
      // break
      } 
      console.log('vous et l\'enemie est encore en vie')
      // VieEnemy = enemyStat.hp
      break
    }
    
    console.log(k)
    if(k===1){
      r = 0; 
      niv+=1
      // 
    }else if(k===2){
      console.log('tu es archi null')
      y = 0;
      VieHero = heroStat.hp;
      // alert('Game Over')
    }
    }
    
    setTimeout(function(){
    hero.classList.remove('animation')
    hero.classList.remove('animationAttak')
    feu.classList.remove('animationfeu')
    enemy.classList.remove('sautEnemy')
    enemy.classList.remove('enemytouche')
    // hero.classList.remove('herotouche')
    },500)
    
    setTimeout(function(){
    hero.classList.remove('herotouche')
    feuE.classList.remove('animationfeuE')  
    },1500)
    
    // deplacement de l'enemy 
    enemy.style.right= (r)+'px'
    
    
    // barre de vie
    VH = ((VieHero*100)/heroStat.hp)
    VE = ((VieEnemy*100)/enemyStat.hp)
    
    document.documentElement.style.setProperty('--vieHero', VH + '%')
    document.documentElement.style.setProperty('--vieEnemy', VE + '%')
    
        
    })
    
    
    function pointImpact() {
    var feuI = feu.getBoundingClientRect();
    var enemyI = enemy.getBoundingClientRect();
    
    // la distance qui separe la balle et l'enmie
    let D = enemyI.x - feuI.x
    // on sais que la vitesse 
    const V = (spdHero*2)*10
    // cherchons le temps qu'il faut pour que la balle touche l'enemie
    let t = D / V
    
    // console.log("je suis la", V)
    if (t>2.75){
      enemy.classList.add('sautEnemy')
    }else{
      enemy.classList.add('enemytouche')
      VieEnemy -= ForcHero
    }
    return VieEnemy;
    
    }
    
    function pointImpact2() {
    var feuEI = feuE.getBoundingClientRect();
    var heroI = hero.getBoundingClientRect();
    
    // la distance qui separe la balle et l'enmie
    let D = feuEI.x - heroI.x 
    
    // on sais que la vitesse 
    const V = (spdEnemy*2)*10
    // cherchons le temps qu'il faut pour que la balle touche l'enemie
    let t = D / V
    // console.log("le temps ", t)
    
    if (t>4){
      // hero.classList.add('sautEnemy')
    }else{
      hero.classList.add('herotouche')
      VieHero -= ForcEnemy
    }
    
    return VieHero;
    }
    
    return niv
  }   
  Game()
  
  
break
}
