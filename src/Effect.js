//
//  Effect.js
//  Yamataikoku
//
//  Created by Fumitoshi Ogata on 01/02/16.
//  Copyright (c) 2016 http://oggata.github.io All rights reserved.
//

var Effect = cc.Node.extend({
    ctor: function(game, effectType) {
        this._super();
        this.game = game;

        if (effectType) {
            if (effectType == 'updated') {
                this.image = "res/pipo-mapeffect013a.png";
                this.itemWidth = 192;
                this.itemHeight = 192;
                this.widthCount = 5;
                this.heightCount = 2;
                this.effectInterval = 0.05;
                this.isRepeat = true;
            }
            if (effectType == 'updating') {
                this.image = "res/pipo-btleffect008.png";
                this.itemWidth = 120;
                this.itemHeight = 120;
                this.widthCount = 8;
                this.heightCount = 1;
                this.effectInterval = 0.12;
                this.isRepeat = true;
            }
            if (effectType == 'destroy') {
                this.image = "res/pipo-goldensphere.png";
                this.itemWidth = 240;
                this.itemHeight = 240;
                this.widthCount = 5;
                this.heightCount = 4;
                this.effectInterval = 0.08;
                this.isRepeat = false;
            }
        }

        if(this.isRepeat == true){
            this.initializeRepeatAnimation();
        }else{
            this.initializeAnimation();
        }
        
        this.effectTime = 0;
    },

    init: function() {},

    initializeRepeatAnimation: function() {
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
        this.addChild(this.sprite);
    },

    initializeAnimation: function() {
        var frameSeq = [];
        for (var i = 0; i < this.heightCount; i++) {
            for (var j = 0; j < this.widthCount; j++) {
                var frame = cc.SpriteFrame.create(this.image, cc.rect(this.itemWidth * j, this.itemHeight * i, this.itemWidth, this.itemHeight));
                frameSeq.push(frame);
            }
        }
        this.wa = cc.Animation.create(frameSeq, this.effectInterval);
        this.ra = cc.Repeat.create(cc.Animate.create(this.wa),1);
        //this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
        this.sprite = cc.Sprite.create(this.image, cc.rect(0, 0, this.itemWidth, this.itemHeight));
        this.sprite.runAction(this.ra);
        this.addChild(this.sprite);
    },
});


var StatusEffect = cc.Node.extend({
    ctor: function(game, posX, posY, effectType) {
        this._super();
        this.game = game;
/*
        this.effectType = effectType;
        if (this.effectType == "destroy") {
            this.effect = new Effect(this.game, 'destroy');
            this.effect.setScale(0.7, 0.7);
            this.effect.setAnchorPoint(0.5, 0.5);
            this.effect.setOpacity(255*0.6);
            this.addChild(this.effect);

        } else if (this.effectType == "fire") {
            this.effect = new Effect(this.game, 'fire');
            this.effect.setScale(3, 3);
            this.effect.setAnchorPoint(0.5, 0.5);
            this.effect.setOpacity(255*0.6);
            this.effect.setPosition(0,50);
            this.addChild(this.effect);
        }
*/
            this.effect = new Effect(this.game, 'updated');
            this.effect.setScale(0.7, 0.7);
            this.effect.setAnchorPoint(0.5, 0.5);
            this.effect.setOpacity(255*0.5);
            this.addChild(this.effect);
            this.effect.setPosition(0,45);

        this.marginY = 0;
        this.posX = posX;
        this.posY = posY;

        this.setPosition(posX,posY);
/*
        var marker = this.game.getBaseHumanPosition(posX, posY);
        if (marker) {
            var dX = marker.getPosition().x;
            var dY = marker.getPosition().y;
            this.setPosition(dX, dY);
        }
*/
        this.effectTime = 0;
    },
    init: function() {},

    update: function() {
        this.effectTime++;
        if (this.effectTime >= 20) {
            return false;
        }
        return true;
    }
});