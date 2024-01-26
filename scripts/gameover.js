


class BubbleOver extends Phaser.Scene {
  constructor() {
    super("BubbleOver");
  }

  init () {
    this.btn_armed = "";
  }

  preload () {
    this.load.image('bg', 'images/triangle-mosaic.png');
    this.load.spritesheet('bubbles', 'images/bubbles.png', 
                          {frameWidth:171, frameHeight: 173});
    this.load.spritesheet('buttons', 'images/buttons.png',
                          {frameWidth:316, frameHeight: 140});

    this.load.audio('gameover_bgm', 'music/Without.mp3', {instances: 1});

  }

  create () {
    bgm_ctx.bgm_obj = this.sound.add('gameover_bgm', {loop: true, volume: bgm_ctx.bgm_volume});
    bgm_ctx.bgm_playing = true;
    bgm_ctx.bgm_obj.play();

    /* Background repeating graphic */
    this.tileSprite = this.add.tileSprite(0,0,1600,1200, 'bg');
    this.tileSprite.setTint(0x110000);

    /* Title Background */
    this.titlebg = this.physics.add.group({
      key: 'bubbles',
      repeat:10,
      setXY: { 
        x: 150, 
        y: 300, 
        stepX: 50 },
    });
    this.titlebg.children.iterate((bub) => bub.y = Math.random() * 600);
    this.titlebg.children.iterate((bub) => bub.x = Math.random() * 800);
    this.titlebg.children.iterate((bub,index) => {
      bub.setFrame(Math.floor(Math.random() * 4));
      bub.alpha = 0.7;
      bub.body.gravity.y = -300 - (Math.random() * 25);
      bub.setScale(0.5).refreshBody();
    });


    /* Text Title */
    this.titleText = this.add.text(400,100, 'Game Over', {
       fontSize: '80px', 
       fill:'#77F',
       boundsAlignH: 'center',
       boundsAlignV: 'middle'
    });
    this.titleText.setFontFamily('bubble');
    this.titleText.setShadow(0,5, 'rgba(0,0,0,1)', 5);

    this.titleText.setOrigin(0.5);

    /* Final Score */
    this.scoreLabel = this.add.text(400, 250, "Final Score:", {
       fontSize: '60px', 
       fill:'#F77',
       boundsAlignH: 'center',
       boundsAlignV: 'middle'
    });
    this.scoreLabel.setFontFamily('bubble');
    this.scoreLabel.setOrigin(0.5);

    this.scoreText = this.add.text(400, 350, bgm_ctx.score, {
       fontSize: '80px', 
       fill:'#FFF',
       boundsAlignH: 'center',
       boundsAlignV: 'middle'
    });
    this.scoreText.setFontFamily('bubble');
    this.scoreText.setOrigin(0.5);

    /* Buttons! */
    this.buttons = this.physics.add.group({
      key: 'buttons',
      repeat: 0,
      setXY: { x: 400, y: 500, stepY: 75 },
      allowGravity: false
    });
    let labels = [ "Menu" ];
    this.buttons.children.iterate ((btn, index) => {
      btn.setScale(0.5).refreshBody();
      btn.setAlpha(0.7);
      var lbl = this.add.text(btn.x, btn.y, labels[index], {fontSize: '32px', fill:'#fee'});
      lbl.setFontFamily('bubble');
      lbl.setOrigin(0.5);

      btn.setInteractive();
      btn.on('pointerover', () => btn.setFrame(1));
      btn.on('pointerout', () => btn.setFrame(0));
      btn.on('pointerdown', () => {
        console.log("Down: " + labels[index]);
        this.btn_armed = labels[index];
        btn.setFrame(2);
      });
      btn.on('pointerup', () => {
        console.log("Up: " + labels[index])
        btn.setFrame(0);
        if (this.btn_armed == labels[index]) {
          console.log("Go for launch: " + labels[index]);
          switch (index) {
            case 0: 
              this.game.sound.stopAll();
              bgm_ctx.bgm_playing = false;
              this.scene.start("BubbleMenu"); 
              break;
          }
        }
      });

    });


  }

  update () {
    this.tileSprite.tilePositionX += 0.1;
    this.tileSprite.tilePositionY += 0.1;

    this.titlebg.children.iterate( (bub) => {
      if (bub.y < -200) {
        bub.y = 700 + (Math.random() * 150);
        bub.x = Math.random() * 800;
        bub.body.gravity.y = -300 - (Math.random() * 25);
        bub.setVelocity(0);
      }
    });
  }
}