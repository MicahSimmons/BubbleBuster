var SHOT = {
  QUEUED: 0,
  FIRED: 1
}


class BubbleRun extends Phaser.Scene {
  constructor () {
    super("BubbleRun");
    this.shootBubble = this.shootBubble.bind(this);
    this.handleHit = this.handleHit.bind(this);
    this.checkPops = this.checkPops.bind(this);
    this.checkFalls = this.checkFalls.bind(this);
    this.findSlot = this.findSlot.bind(this);
    this.buildPuzzle = this.buildPuzzle.bind(this);
  }

  init () {
    this.score = 0;
    this.multiplier = 1.0;
    this.gametime = 90;
    this.level = 10;
  }

  preload () {
    this.load.image('bg', 'images/triangle-mosaic.png');
    this.load.spritesheet('bubbles', 'images/bubbles.png', 
                          {frameWidth:171, frameHeight: 173});
    this.load.audio('game_bgm', 'music/BoneYardWaltz.ogg', {instances: 1});

    this.load.image('crosshair', 'images/crosshair.png');
    this.load.image('launcher', 'images/launcher.png');

    this.load.audio('pop', 'sounds/interface5.wav');
    this.load.audio('score', 'sounds/coin.wav');
    this.load.audio('shoot', 'sounds/swing3.wav');

    this.load.spritesheet('fireworks', 'images/Firework.png', {frameWidth:256, frameHeight:256});
  }

  create () {
    /* BGM */
    if (bgm_ctx.bgm_playing) {
      bgm_ctx.bgm_obj.pause();
    }
    bgm_ctx.bgm_obj = this.sound.add('game_bgm', {loop: true, volume: bgm_ctx.bgm_volume});
    bgm_ctx.bgm_playing = true;
    bgm_ctx.bgm_obj.play();

    /* Background repeating graphic */
    this.tileSprite = this.add.tileSprite(0,0,1600,1200, 'bg');
    this.tileSprite.setTint(0xaaaadd);

    /* Game Clock */
    let timedEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callbackScope: this,
      callback: () => {
        if (this.gametime-- <= 0) {
          this.game.sound.stopAll();
          bgm_ctx.score = this.score;
          this.scene.start("BubbleOver");
        }
      }
    });
    this.clockText = this.add.text(16,16, '00', {fontSize: '32px', fill:'#000'});
    this.clockText.setFontFamily('bubble');

    /* Scoreboard */
    this.scoreText = this.add.text(600, 16, 'Score: 00', {fontSize: '32px', fill:'#000', align:'right'});
    this.scoreText.setFontFamily('bubble');

    this.multiText = this.add.text(600, 48, 'x1', {fontSize: '16px', fill:'#000', align:'right'});
    this.multiText.setFontFamily('bubble');

    /* Setup Mouse tracking */
    this.input.topOnly = true;
    this.target = this.add.sprite(400, 300, 'crosshair').setScale(0.3);
    this.target.setAlpha(0.5);

    /* World Bounds */
    this.physics.world.setBoundsCollision(true, true, false, false);

    /* Spawn a bubble to launch */
    this.ammo = this.physics.add.group({
      key: 'bubbles',
      repeat:4,
      setXY: { 
        x: 400, 
        y: 575, 
        stepX: -50 
      },
      allowGravity: false
    });
    this.ammo.children.iterate((shot) => {
      shot.setScale(0.3);
      shot.status = SHOT.QUEUED;
      shot.color = Math.floor(3 * Math.random());
      shot.setFrame(shot.color);
      shot.body.setCircle(50);
    });

    /* Bubble Launcher */
    this.launcher = this.add.sprite(400, 575, 'launcher');
    this.launcher.setScale(0.7);
    this.launcher.angle += 45;
    this.launcher.depth = 9999;

    this.input.on('pointerdown', () => console.log("Mouse Down"));
    this.input.on('pointerup', this.shootBubble); 
  
    /* Animated explosions */
    this.anims.create({
      key: 'bangbang',
      frames: this.anims.generateFrameNumbers('fireworks', {start:0, end:29}),
      frameRate: 20,
      repeat: 0
    });
    this.fireworks = this.add.group();

    /* Targets to shoot at */
    this.buildPuzzle(this.level);

    /* Placeholder for falling objects */
    this.falling = this.physics.add.group();

    /* Ammo vs. Puzzle Collider */
    this.physics.add.collider(this.ammo, this.puzzle, this.handleHit);

  }

  findSlot (puz_bub) {
    console.log("findSlot(x:" + puz_bub.x + " y:" + puz_bub.y + ")");
    let adj_coords = [
      { x: puz_bub.x + 25, y: puz_bub.y + 43 },
      { x: puz_bub.x - 25, y: puz_bub.y + 43 }
    ];

    if (puz_bub.y > 0) {
      if (puz_bub.x >= 400) {
        adj_coords.push( { x: puz_bub.x + 50, y: puz_bub.y });
      } else {
        adj_coords.push( { x: puz_bub.x - 50, y: puz_bub.y });
      }
    }

    let use_child = false;
    let child_loc = {x: -1, y:-1};

    let test_idx = Math.floor(Math.random() * adj_coords.length);
    console.log("Trying " + adj_coords[test_idx].x + "," + adj_coords[test_idx].y);
    this.puzzle.children.iterate( (child) => {
      if ((child.x == adj_coords[test_idx].x) &&
          (child.y == adj_coords[test_idx].y)) {
        child_loc = this.findSlot(child);
        use_child = true;
      }
    });

    if (use_child) {
      console.log("Using Child slot at " + adj_coords[test_idx].x + "," + adj_coords[test_idx].y);
      return child_loc;
    } else {
      console.log("Open slot at " + adj_coords[test_idx].x + "," + adj_coords[test_idx].y);
      return {x: adj_coords[test_idx].x, y: adj_coords[test_idx].y };
    }
  }

  buildPuzzle (level) {
    try {
      this.puzzle.clear();
    } catch (error)  {
      console.log("Puzzle not initialized.");
    }

    this.puzzle = this.physics.add.group({
      key: 'bubbles',
      repeat:level,
      setXY: {
        x: 400,
        y: 0
      },
      allowGravity: false
    });
    this.puzzle.children.iterate( (bub, index) => {
      bub.color = 3;
      bub.setFrame(bub.color);
      bub.setScale(0.3);
      bub.setImmovable(true);
      bub.body.setCircle(50);
      bub.setAlpha(0.8);

      if (index == 0) {
        this.anchor = bub;
      } else {
        let loc = this.findSlot(this.anchor);
        bub.x = loc.x;
        bub.y = loc.y;
        bub.color = Math.floor(Math.random() * 3);
        bub.setFrame(bub.color);
        console.log("puzzle bub " + index + "(" + bub.x + "," + bub.y + ")");

        let bang = this.add.sprite(bub.x, bub.y, 'fireworks');
        bang.anims.play('bangbang');
        bang.age = 0;
        bang.setTint(0x0000ff);
        this.fireworks.add(bang);

      }
    });
  }

  checkFalls(puz_bub) {
    puz_bub.fall_mark = true;

    /* Find adjacency Coords */
    let adj_coords = [
      { x: puz_bub.x + 25, y: puz_bub.y - 43 },
      { x: puz_bub.x - 25, y: puz_bub.y - 43 },
      { x: puz_bub.x + 50, y: puz_bub.y },
      { x: puz_bub.x - 50, y: puz_bub.y },
      { x: puz_bub.x + 25, y: puz_bub.y + 43 },
      { x: puz_bub.x - 25, y: puz_bub.y + 43 }
    ];

    /* Mark all adjacent bubbles as supported */
    this.puzzle.children.iterate( (test_bubble) => {
      adj_coords.forEach( (coords) => {
        if ((test_bubble.x == coords.x) &&
            (test_bubble.y == coords.y)) {
          if (test_bubble.fall_mark == false) {
            this.checkFalls(test_bubble);
          }
        }
      });
    });
  }

  checkPops(puz_bub) {
    let match_count = 0;
    console.log("checkPops(" + puz_bub.x + "," + puz_bub.y + " color:" + puz_bub.color);

    /* Mark self */
    puz_bub.match_mark = true;
    match_count++;

    /* Find adjacency Coords */
    let adj_coords = [
      { x: puz_bub.x + 25, y: puz_bub.y - 43 },
      { x: puz_bub.x - 25, y: puz_bub.y - 43 },
      { x: puz_bub.x + 50, y: puz_bub.y },
      { x: puz_bub.x - 50, y: puz_bub.y },
      { x: puz_bub.x + 25, y: puz_bub.y + 43 },
      { x: puz_bub.x - 25, y: puz_bub.y + 43 }
    ];

    /* Search for any bubbles matching adjacency */
    this.puzzle.children.iterate( (test_bubble) => {
      adj_coords.forEach( (coords) => {
        if ((test_bubble.x == coords.x) &&
            (test_bubble.y == coords.y)) {
          //console.log("found adj(" + test_bubble.x + "," + test_bubble.y + ")  Mark:" + test_bubble.match_mark + " color:" + test_bubble.color);
          /* Is it the same color? */
          /* Did we already count this one? */
          if ((test_bubble.match_mark == false) &&
              (test_bubble.color == puz_bub.color)) {
            match_count += this.checkPops(test_bubble);
          }
        }
      });
    });

    /* Return number of matching bubbles in cluster */
    return match_count;
  }

  handleHit(shot, puz_bub) {

    this.puzzle.children.iterate((child) => {
      console.log("Clearing marker from (" + child.x + "," + child.y + ")");
      child.match_mark = false
      child.fall_mark = false;
    });

    let match = 1;
    if (shot.color == puz_bub.color) {
      match += this.checkPops(puz_bub);
      console.log("Matched " + match);      
    }

    if (match >= 3) {
      /* If three in a row... pop the bubbles! */
      this.puzzle.children.iterate( (child) => {
        if ((child) && (child.match_mark)) {
          let bang = this.add.sprite(child.x, child.y, 'fireworks');
          bang.anims.play('bangbang');
          bang.age = 0;
          this.fireworks.add(bang);

          this.puzzle.remove(child, true, true);
          this.sound.add('pop', {loop: false, volume: bgm_ctx.sfx_volume}).play();
          this.score += 100 * (this.level / 5);
        }
      });

      /* Delete inside of an iterate is always dangerous.  Do it twice. :D */
      this.puzzle.children.iterate( (child) => {
        if ((child) && (child.match_mark)) {
          this.puzzle.remove(child, true, true);
          this.sound.add('pop', {loop: false, volume: bgm_ctx.sfx_volume}).play();
          this.score += 100 * (this.level / 5);
        }
      });

      /* Check for falling rocks */
      this.checkFalls(this.anchor);
      this.puzzle.children.iterate( (child) => {
        if (child.fall_mark == false) {
          this.falling.add(child);
          child.setImmovable(false);
          child.body.setAllowGravity(true);
        }
      });

      this.falling.children.iterate((child) => {
        this.puzzle.remove(child,false, false);
        let dx = Math.random() * 200;
        let dy = -1 * Math.random() * 200;
        if (child.x < 400) {
          dx = dx * -1;
        }
        child.setVelocity(dx, dy);
      });
    } else {
      /* If not three in a row, the ammo joins the blob */
      console.log("Impact!");

      /* Snap puzzle bub to row / col */
      let snap_y = 43 + (Math.floor(shot.y / 43) * 43);
      let snap_x = Math.floor(shot.x / 50) * 50;
      if ((snap_y / 43) % 2) {
        snap_x += 25;
      }

      this.puzzle.children.iterate( (child) => {
        if ((child.x == snap_x) && (child.y == snap_y)) {
          snap_x += 50;
        }
      });


      /* Create new puzzle bub */
      let new_bub = this.physics.add.sprite(snap_x, snap_y, 'bubbles');
      this.puzzle.add(new_bub);

      new_bub.color = shot.color;
      new_bub.setFrame(new_bub.color);
      new_bub.setScale(0.3);
      new_bub.body.setCircle(50);
      new_bub.setImmovable(true);
      new_bub.setAlpha(0.8);

    }

    /* Destroy shot */
    this.ammo.remove(shot, true, true);
  }

  shootBubble () {
    console.log("Shooting Bubble");
    let dy = this.input.mousePointer.y - 575;
    let dx = this.input.mousePointer.x - 400;
    let rad = Math.atan2(dy, dx);
    let force_x = Math.cos(rad) * 800;
    let force_y = Math.sin(rad) * 800;
    let shot_fired = false;

    this.ammo.children.iterate((shot, index) => {
      if ((shot_fired == false) && (shot.status == SHOT.QUEUED)) {
        shot_fired = true;
        shot.status = SHOT.FIRED;
        this.sound.add('shoot', {loop: false, volume: bgm_ctx.sfx_volume}).play();

        shot.setVelocity(force_x, force_y);
        shot.setCollideWorldBounds();
        shot.body.bounce.setTo(1,1);
      }

      if (shot.status == SHOT.QUEUED) {
        shot.x += 50;
      }
    });

    /* Replenish ammo supply */
    let new_bub = this.physics.add.sprite(400-200, 575, 'bubbles');
    this.ammo.add(new_bub, true);
    new_bub.setScale(0.3);
    new_bub.status = SHOT.QUEUED;
    new_bub.color = Math.floor(3 * Math.random());
    new_bub.setFrame(new_bub.color);
    new_bub.body.setCircle(50);

  }

  update () {
    this.tileSprite.tilePositionX += 0.1;
    this.tileSprite.tilePositionY += 0.1;
    this.clockText.text = this.gametime;
    switch (Math.floor(this.gametime / 10)) {
      case 9: this.tileSprite.setTint(0xaaaadd); break;
      case 8: this.tileSprite.setTint(0x8888dd); break;
      case 7: this.tileSprite.setTint(0x7777bb); break;
      case 6: this.tileSprite.setTint(0x6666bb); break;
      case 5: this.tileSprite.setTint(0x555588); break;
      case 4: this.tileSprite.setTint(0x444488); break;
      case 3: this.tileSprite.setTint(0x333366); break;
      case 2: this.tileSprite.setTint(0x222266); break;
      case 1: this.tileSprite.setTint(0x331133); break;
      case 0: this.tileSprite.setTint(0x551133); break;
    }

    this.scoreText.text = "Score: " + this.score;
    this.multiText.text = "Level:" + ((this.level-5) / 5) + "  x" + Math.floor(this.multiplier * 10) / 10;

    this.target.setPosition(this.input.mousePointer.x, this.input.mousePointer.y);

    let dy = this.input.mousePointer.y - 575;
    let dx = this.input.mousePointer.x - 400;
    let rad = Math.atan2(dy, dx);
    let deg = rad * 180 / Math.PI;
    this.launcher.angle = 45 + deg;

    this.ammo.children.iterate((shot, index) => {
      if ((shot) && (shot.y < -100)) {
        console.log("Removing " + index);
        this.ammo.remove(shot, true, true);
        this.multiplier = 1.0;
      }
    });

    this.falling.children.iterate((bub) => {
      if ((bub) && (bub.y > 600)) {
        this.sound.add('score', {loop: false, volume: bgm_ctx.sfx_volume}).play();
        this.multiplier += 0.1;
        this.score += 150 * this.multiplier * (this.level / 5);
        this.falling.remove(bub, true, true);
      }
    });

    this.fireworks.children.iterate( (bang) => {
      if ((bang) && (bang.age++ > 90)) {
        this.fireworks.remove(bang, true, true);
      }
    });

    if (this.puzzle.countActive() == 1) {
      this.level += 5;
      this.buildPuzzle(this.level);
      this.physics.add.collider(this.ammo, this.puzzle, this.handleHit);
    }
  }
}