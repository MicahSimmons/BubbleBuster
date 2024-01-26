


class BubbleCredits extends Phaser.Scene {
  constructor() {
    super("BubbleCredits");
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
  }

  create () {
    /* Background repeating graphic */
    this.tileSprite = this.add.tileSprite(0,0,1600,1200, 'bg');
    this.tileSprite.setTint(0xaaffbb);

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
    this.titleText = this.add.text(400,100, 'Credits', {
       fontSize: '80px', 
       fill:'#77F',
       boundsAlignH: 'center',
       boundsAlignV: 'middle'
    });
    this.titleText.setFontFamily('bubble');
    this.titleText.setShadow(0,5, 'rgba(0,0,0,1)', 5);

    this.titleText.setOrigin(0.5);

    /* Credits Text */
    this.creditText = this.add.text(400,300, '', {
      fontSize: '20px',
      fill: '#000',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    });
    this.creditText.setFontFamily('bubble');
    this.creditText.setOrigin(0.5);

    let textOut = "Bubble Buster, implemented by Micah Simmons for SRJC CS42 Spring 2022";
    textOut += "\n\n";
    textOut += "The following third-party resources were used in the production of this game:\n\n";
    textOut += "       'Triangle Mosaic Pattern' by Myriam Lefebvre\n";
    textOut += "       'Free Bubble Game Button Pack' by pzUH\n";
    textOut += "       'Slider Plugin' by @RexRainbow\n";
    textOut += "       'Soft Mysterious Harp Loop' by VWolfdog\n";
    textOut += "       'Bone Yard Waltz by Wolfgang\n";
    textOut += "       'RPG Sound Pack' by artisticdude\n";
    textOut += "       'Fireworks Effect' by jellyfizh\n";
    textOut += "       'Without' by Alexandr Zhelanov\n";

    this.creditText.text = textOut;

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
            case 0: this.scene.start("BubbleMenu"); break;
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