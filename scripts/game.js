/*  Students: Please use this week's project for Week 5: Assignment 6: Working with Sprites + Controls. 
     You will need to replace the contents of this JavaScript file with your own work, 
     and create any other files, if any, required for the assignment.
     When you are done, be certain to submit the assignment in Canvas to be graded. */


class BubbleGame {
  constructor (dom_id) {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: [
        BubbleMenu,
        BubbleOptions,
        BubbleCredits,
        BubbleRun,
        BubbleOver
      ],
      parent: dom_id
    };

    this.game = new Phaser.Game(this.config);
  }
}