var Emotion = cc.Node.extend({
    ctor: function(game, creature, emotionType) {
        this._super();
        this.game = game;
        this.creature = creature;
        if(emotionType == 1){
            this.image = "res/emotion-001.png";
        }else if(emotionType == 2){
            this.image = "res/emotion-002.png";
        }else if(emotionType == 3){
            this.image = "res/emotion-003.png";
        }else if(emotionType == 4){
            this.image = "res/emotion-004.png";
        }else if(emotionType == 5){
            this.image = "res/emotion-005.png";
        }else{
            this.image = "res/emotion-001.png";
        }

        this.itemWidth = 93/3;
        this.itemHeight = 31;
        this.widthCount = 3;
        this.heightCount = 1;
        this.effectInterval = 0.2;

        this.initializeWalkAnimation();
        this.effectTime = 0;

        this.timeCnt = 0;
        this.maxTimeCnt = 30 * 5;
    },

    init: function() {},

    update: function() {
        /*
        if(this.creature){
            this.setPosition(
                this.creature.getPosition().x,
                this.creature.getPosition().y + 42
            );
        }
        */
        this.timeCnt++;
        if(this.timeCnt >= this.maxTimeCnt){
            return false;
        }
        return true;
    },

    initializeWalkAnimation: function() {
        var frameSeq = [];
        for (var i = 0; i < this.heightCount; i++) {
            for (var j = 0; j < this.widthCount; j++) {
                var frame = cc.SpriteFrame.create(this.image, cc.rect(this.itemWidth * j, this.itemHeight * i, this.itemWidth, this.itemHeight));
                frameSeq.push(frame);
            }
        }
        this.wa = cc.Animation.create(frameSeq, this.effectInterval);
        //this.ra = cc.Repeat.create(cc.Animate.create(this.wa),1);
        this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
        this.sprite = cc.Sprite.create(this.image, cc.rect(0, 0, this.itemWidth, this.itemHeight));
        this.sprite.runAction(this.ra);
        //this.sprite.setAnchorPoint(0.5,0);
        this.addChild(this.sprite);
    },
});
