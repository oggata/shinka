//
//  Animal.js
//  Yagidan
//
//  Created by Fumitoshi Ogata on 10/10/15.
//  Copyright (c) 2015 http://oggata.github.io All rights reserved.
//

var Food = cc.Node.extend({
    ctor: function(game, x, y, typeId) {
        this._super();
        this.game = game;
        this.hp = 100;
        this.typeId = typeId;
        this.amount = 60 * 1;

        this.setPosition(x, y);

        this.dixtX = x;
        this.dixtY = y + 30;
        this.walkSpeed = 10;

        this.enableEat = false;
        this.enableEatCnt = 0;

        this.image = "res/food-001.png";
        this.imgWidth = 50;
        this.imgHeight = 50;

        var _rand =  this.game.getRandNumberFromRange(0,4);
        _rand = 0;
        this.spriteNum = _rand;
        this.scaleRate = 0.45;
        var frameSeq = [];
        for (var i = 0; i <= 1; i++) {
            var frame = cc.SpriteFrame.create(this.image, cc.rect(this.imgWidth * i, this.imgHeight * this.spriteNum, this.imgWidth, this.imgHeight));
            frameSeq.push(frame);
        }
        this.wa = cc.Animation.create(frameSeq, 0.2);
        this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
        this.sprite = cc.Sprite.create("res/food-001.png", cc.rect(0, 0, this.imgWidth, this.imgHeight));
        this.sprite.runAction(this.ra);
        this.sprite.setAnchorPoint(0.5, 0);
        this.addChild(this.sprite);
        this.sprite.setScale(this.scaleRate, this.scaleRate);

    
        this.centerBase = cc.LayerColor.create(new cc.Color(255,255,0,255),10,10);
        this.centerBase.setPosition(0,0);
        this.addChild(this.centerBase);
    },
    init: function() {},

    update: function() {
        //放出した瞬間に食べられないようにラグを作る
        this.enableEatCnt++;
        if (this.enableEatCnt >= 30 * 2) {
            this.enableEat = true;
        }
        this.moveToPositions(this.dixtX, this.dixtY);
        if (this.hp <= 0) {
            return false;
        }
        return true;
    },

    moveToPositions: function(posX, posY) {
        var dX = posX - this.getPosition().x;
        var dY = posY - this.getPosition().y;
        var _dist = Math.sqrt((dX * dX) + (dY * dY));
        if (_dist <= 20) {
            this.setPosition(
                posX, posY
            );
        } else {
            var rad = Math.atan2(dX, dY);
            var speedX = this.walkSpeed * Math.sin(rad);
            var speedY = this.walkSpeed * Math.cos(rad);
            this.setPosition(
                this.getPosition().x + speedX,
                this.getPosition().y + speedY
            );
        }
    },

    remove: function() {
        this.removeChild(this.sprite);
    },
    getDirection: function() {
        return this.direction;
    },
});