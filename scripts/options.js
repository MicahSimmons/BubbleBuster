


class BubbleOptions extends Phaser.Scene {
  constructor() {
    super("BubbleOptions");
  }

  init () {
    this.btn_armed = "";
  }

  preload () {
    this.load.plugin('rexsliderplugin', 'resources/rexsliderplugin.min.js', true);

    this.load.image('bg', 'images/triangle-mosaic.png');
    this.load.spritesheet('bubbles', 'images/bubbles.png', 
                          {frameWidth:171, frameHeight: 173});
    this.load.spritesheet('buttons', 'images/buttons.png',
                          {frameWidth:316, frameHeight: 140});

    this.load.spritesheet('btn_bgm', 'images/music.png',
                          {frameWidth:171, frameHeight: 173});
    this.load.spritesheet('btn_sfx', 'images/sound.png',
                          {frameWidth:171, frameHeight: 173});

    this.load.audio('pop', 'sounds/interface5.wav');
  }

  create () {
    /* Background repeating graphic */
    this.tileSprite = this.add.tileSprite(0,0,1600,1200, 'bg');
    this.tileSprite.setTint(0xaabbff);

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
    this.titleText = this.add.text(400,100, 'Options', {
       fontSize: '80px', 
       fill:'#77F',
       boundsAlignH: 'center',
       boundsAlignV: 'middle'
    });
    this.titleText.setFontFamily('bubble');
    this.titleText.setShadow(0,5, 'rgba(0,0,0,1)', 5);

    this.titleText.setOrigin(0.5);

    /* BGM and SFX sliders */
    let bgm_ep = [
      {x: 400 - 200, y: 275 },
      {x: 400 + 200, y: 275 }
    ];
    this.add.graphics()
        .lineStyle(3, 0x55ff55, 1)
        .strokePoints(bgm_ep);
    this.bgm_btn = this.add.sprite(400, 275, 'btn_bgm');
    this.bgm_btn.setScale(0.5);
    this.bgm_slider = this.plugins.get('rexsliderplugin').add(this.bgm_btn, {
      endPoints: bgm_ep,
      value: bgm_ctx.bgm_volume
    });
    this.bgm_btn.on('pointerup', () => {
      bgm_ctx.bgm_volume = this.bgm_slider.value;
      bgm_ctx.bgm_obj.setVolume(bgm_ctx.bgm_volume);
    });

    let sfx_ep = [
      {x: 400 - 200, y: 375 },
      {x: 400 + 200, y: 375 }
    ];
    
    this.add.graphics()
        .lineStyle(3, 0x55ff55, 1)
        .strokePoints(sfx_ep);
    this.sfx_btn = this.add.sprite(400, 375, 'btn_sfx');
    this.sfx_btn.setScale(0.5);
    this.sfx_slider = this.plugins.get('rexsliderplugin').add(this.sfx_btn, {
      endPoints: sfx_ep,
      value: bgm_ctx.sfx_volume
    });
    this.sfx_btn.on('pointerup', () => {
      bgm_ctx.sfx_volume = this.sfx_slider.value;
      this.sound.add('pop', {loop: false, volume: bgm_ctx.sfx_volume}).play();

    });

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
      btn.on('pointerover', () => {
        btn.setFrame(1);
        console.log(this.bgm_slider.value);
      });
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

    if (this.bgm_slider.value > 0) {
      this.bgm_btn.setFrame(1);
    } else {
      this.bgm_btn.setFrame(0);
    }

    if (this.sfx_slider.value > 0) {
      this.sfx_btn.setFrame(1);
    } else {
      this.sfx_btn.setFrame(0);
    }
  }
}