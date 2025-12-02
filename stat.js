// var players = JSON.parse(players);
// var enemies = JSON.parse(enemies);

// let heroStat = {
//     id: players[0].id,
//     name: players[0].name,
//     hp: players[0].hp,
//     str: players[0].str,
//     spd: players[0].spd
// } 

// let enemyStat = {
//     id: enemies[0].id,
//     name: enemies[0].name,
//     hp: enemies[0].hp,
//     str: enemies[0].str,
//     spd: enemies[0].spd
// }

// export let nameHero = heroStat.name

while (lifeBolo > 0 || lifeJoueur > 0) {
    // enemie

    const affBolo = function affichageBolo() {
      let y = '#';
      y = clc.yellow(y);
      console.log(clc.red(nameB));
      console.log('HP: ', y.repeat(lifeBolo), lifeBolo, '/', lifeBoloChang, '\n');

      return lifeBolo + forceBolo + nameB;
    };
    affBolo();

    // joueur

    const affJoueur = function affichageJoueur() {
      const nameJ = joueur.name;
      let x = '#';
      x = clc.red(x);
      console.log(clc.green(nameJ));
      console.log('HP: ', x.repeat(lifeJoueur), lifeJoueur, '/', joueur.hp, '\n');

      return lifeJoueur + forceJoueur;
    };
    affJoueur();

    // ::::::: le choix du joueur

    const jchoise = function joueurChoise() {
      console.log('---Options------');
      let choise = readFileSync.question('1. Attack   2.Heal \n');

      const attack = 1;
      const defense = 2;

      choise = parseInt(choise, 10);

      if (choise === attack) {
        choixDujoueur = 1;
      } else if (choise === defense) {
        choixDujoueur = 2;
      }
      //   else {
      //     console.log('vous n\'avez pas fais un choix');
      //   }

      return choixDujoueur;
    };

    jchoise();

    if (choixDujoueur === 1) {
      lifeBolo -= forceJoueur;
      lifeJoueur -= forceBolo;
      console.clear();

      console.log('vous avez attaqué et infligé ', forceJoueur, ' de dégâts');
      console.log(nameB, 'vous a attaqué et a infligé ', forceBolo, ' de dégâts');
    } else if (choixDujoueur === 2) {
      lifeJoueur += (joueur.hp * 0.5);
      if (lifeJoueur > joueur.hp) {
        lifeJoueur = joueur.hp;
        lifeJoueur -= forceBolo;
      }
      console.clear();

      console.log('tu as utilisé la guérison');
      console.log(nameB, 'vous a attaqué et a infligé ', forceBolo, ' de dégâts');
    }

    if (lifeBolo <= 0) {
      console.log('vous avez vaincu', enemie.name, '\n');
      break;
    } else if (lifeJoueur <= 0) {
      console.log('vous avez perdu');
      break;
    }
  }

  if (lifeJoueur <= 0) {
    console.log(clc.red(':( :( :( :( :(').repeat(39), '     VOUS AVEZ PERDU LA PARTIE     ', clc.red(':( :( :( :( :(').repeat(40));
    break;
  } else {
    if (j <= 8) {
      console.log(clc.green('vous avez gagnez le FIGHT'), j, '========== \n \n');
      readFileSync.question('Appuyer sur entree pour passer au niveau suivant \n');
      lifeBolo = enemie.hp;
    } else if (j >= 9) {
      console.log(clc.green('vous avez gagnez le FIGHT'), j, '========== \n \n');
    }

    j += 1;

    if (j === 10) {
      lifeBolo = lifeBoss;
      forceBolo = forceBoss;
      nameB = nameBf;
      lifeBoloChang = lifeBossChang;
      console.log(clc.red(':) :) :) :) :)').repeat(39), '     VOUS ALLEZ AFFRONTER L BOSS     ', clc.red(':) :) :) :) :)').repeat(40));
      readFileSync.question('Appuyer sur entree pour ', clc.red('AFFRONTER LE BOSS'), '\n');
      lifeBolo = bossFin.hp;
    } else if (j > 10) {
      console.log(
        clc.green(':) :) :) :) :)').repeat(39),
        '     FELICITATION TU AS TUER LE BOSS     ',
        clc.green(':) :) :) :) :)').repeat(40),
      );
      readFileSync.question(
        'Appuyer sur entree pour terminer la partie',
        '\n',
      );
      lifeBolo = enemie.hp;
      break;
    }

    i += 1;

    console.clear();
  }

