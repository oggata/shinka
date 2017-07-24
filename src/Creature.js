//
//  Creature.js
//  Territory
//
//  Created by Fumitoshi Ogata on 5/30/14.
//  Copyright (c) 2014 http://oggata.github.io All rights reserved.
//

var Creature = cc.Node.extend({
    ctor: function(game, id, creatureId) {
        this._super();
        this.game = game;
        this.creatureId = creatureId;
        //生物IDごとによるパラメーター
        var creatureData = CONFIG.CREATURE[creatureId];
        this.creatureData = creatureData;
        this.image = creatureData["image"];
        this.name = creatureData["name"];
        this.spriteNum = creatureData["spriteNum"];
        this.isMove = creatureData["isMove"];
        this.scaleRate = creatureData["scale"];
        this.walkSpeed = creatureData["speed"];
        this.imgWidth = creatureData["width"];
        this.imgHeight = creatureData["height"];
        this.creatureType = creatureData["creatureType"];
        this.evolutionTime = creatureData["evolutionTime"];
        this.evolutionFoodCnt = creatureData["evolutionFoodCnt"];
        this.next = creatureData["next"];

        //init
        this.initSprite();

        //方向制御用
        this.direction = "front";
        this.directionCnt = 0;
        this.beforeX = this.getPosition().x;
        this.beforeY = this.getPosition().y;

        this.walkingDestination = new Object;
        this.walkingDestination.x = 0;
        this.walkingDestination.y = 0;
        this.walkingDestinationCnt = 0;
        this.randSec = this.game.getRandNumberFromRange(1, 10);

        //動きに必要なパラメータ 
        // 0:ランダム(追従しない) 1:リーダーについていく
        this.moveId = this.game.getRandNumberFromRange(1, 4);
        this.isLeader = false;
        this.animationInterval = 0.025;
        this.flashCnt = 0;
        this.isCharaVisible = true;

        this.deadCnt = 0;

        this.effect = new Effect(this.game, 'updating');
        this.effect.setScale(0.5, 0.5);
        this.effect.setPosition(0, 30);
        this.addChild(this.effect);

        if(this.creatureId == 1 || this.creatureId == 2 || this.creatureId == 3 || this.creatureId == 4 || this.creatureId == 5){
            this.effectTime = 99;
        }else{
            this.effectTime = 0;
        }
        this.isBattle = false;

        this.targetEnemy = null;
    },

    save: function() {
        this.game.storage.saveCreatureDataToStorage(
            this
        );
    },

    addEmotion: function(emotionId) {
        var _cnt = 0;
        for (var e = 0; e < this.game.emotions.length; e++) {
            if (this.game.emotions[e].creature == this) {
                _cnt++;
            }
        }
        if (_cnt == 0) {
            this.emotion = new Emotion(this.game, this, emotionId);
            this.emotion.setPosition(this.imgWidth/2,this.imgHeight/2);
            this.sprite.addChild(this.emotion);
            this.game.emotions.push(this.emotion);
        }
    },

    doEvolutionAction: function() {
        //元に戻す
        this.game.addStatusEffect(
            this.getPosition().x,
            this.getPosition().y,
            1
        );
        var _creatureId = this.next[0];
        this.game.addNewCreature(
            _creatureId,
            this.getPosition().x,
            this.getPosition().y,
            false
        );
    },

    eat: function() {
        this.foodCnt += 1;
        this.deadTime = parseInt(new Date() / 1000) + this.creatureData["deadTime"];
    },

    isPreparedLevelUp: function() {
        if (this.foodCnt >= this.evolutionFoodCnt) {
            return true;
        }
        return false;
    },

    setTargetTime: function() {
        this.targetTime = parseInt(new Date() / 1000) + this.creatureData["evolutionTime"];
    },

    removeEmotion: function() {
        //emotionを削除する
        for (var e = 0; e < this.game.emotions.length; e++) {
            if (this.game.emotions[e].creature == this) {
                this.game.baseNode.removeChild(this.game.emotions[e]);
                this.game.emotions.splice(e, 1);
            }
        }
    },

    setWalkingDestination:function() {

        var _minDist = 9999;

        for (var e = 0; e < this.game.enemies.length; e++) {
            var distance = cc.pDistance(this.getPosition(), this.game.enemies[e].getPosition());
            if (distance <= _minDist) {
                _minDist = distance;
                this.walkingDestination.x = this.game.enemies[e].getPosition().x;
                this.walkingDestination.y = this.game.enemies[e].getPosition().y;
            }
        }

        for (var f = 0; f < this.game.foods.length; f++) {
            var distance = cc.pDistance(this.getPosition(), this.game.foods[f].getPosition());
            if (distance <= _minDist) {
                _minDist = distance;
                //this.creatures[c].isBattle = true;
                this.walkingDestination.x = this.game.foods[f].getPosition().x;
                this.walkingDestination.y = this.game.foods[f].getPosition().y;
            }
        }
    },

    update: function() {

        this.effectTime++;
        var _y = 0;
        if (this.effectTime <= 60) {
            _y = 8 * (this.effectTime) - 1 / 2 * 9.8 * (this.effectTime / 5) * (this.effectTime / 5) + 0;
            if(_y > 0){
                //this.sprite.setPosition(0, _y);
            }
        }else{
            if(this.isBattle == true){
                this.effectTime = 0;
            }
        }

        if(_y > 0){
            this.sprite.setPosition(0, _y);
        }

        this.effect.setVisible(false);

        if (this.foodCnt >= this.evolutionFoodCnt) {
            this.addEmotion(5);
        }

        if (this.status == "remove") {
            //emotionを削除する
            this.removeEmotion();
            return false;
        }

        //瀕死
        if (0 < this.getHp() && this.getHp() <= this.creatureData["deadTime"] / 10) {
            this.addEmotion(1);
        }

        //死亡時
        if (this.getHp() <= 0) {
            this.addEmotion(2);
            this.status = "dead";
            this.targetTime = 0;
            this.deadSprite.setVisible(true);
            this.sprite.setVisible(false);
            //emotionを削除する
            this.removeEmotion();
            this.deadCnt++;
        }

        if (this.deadCnt == 1) {
            this.effect1 = new Effect(this.game, 'destroy');
            this.effect1.setScale(0.5, 0.5)
            this.effect1.setPosition(0, 30)
            this.addChild(this.effect1, 9999999);
        }

        if (this.deadCnt >= 30 * 30) {
            //this.game.addFood(this.getPosition().x, this.getPosition().y, 1);
            this.status = "remove";
            //emotionを削除する
            this.removeEmotion();
            return false;
        }

        //進化中
        if (this.targetTime > 0 && this.getHp() > 0) {
            this.status = "evolution";

            if (this.creatureId == 1 || this.creatureId == 2 || this.creatureId == 3 || this.creatureId == 4 || this.creatureId == 5) {
                this.effect.setVisible(false);
            } else {
                this.effect.setVisible(true);
            }

            this.deadTime = 999999;
            this.pastSecond = this.getPastSecond2();

            //pastsecondがマイナスになったら進化アクションを起こす
            if (this.pastSecond <= 0) {
                this.targetTime = 0;
                this.status = "remove";
                this.deadTime = parseInt(new Date() / 1000) + this.creatureData["deadTime"];
                this.doEvolutionAction();
            }
            this.pastMin = Math.floor(this.pastSecond / 60);
            this.pastHour = Math.floor(this.pastSecond / 3600);
            this.pastSec = this.pastSecond - this.pastMin * 60 - this.pastHour * 3600;
            //this.timeLabel.setString(
            //    ("0" + this.pastHour).slice(-2) + ":" + ("0" + this.pastMin).slice(-2) + ":" + ("0" + this.pastSec).slice(-2) + "");
        }
        //flush
        if (this.isFlush == true) {
            this.addFlashCnt();
        } else {
            this.isCharaVisible = true;
            this.sprite.setOpacity(255);
        }
        this.isFlush = false;

        if (this.isMove == true && this.status == "normal") {
            //向きの制御
            this.directionCnt++;
            if (this.directionCnt >= 5) {
                this.directionCnt = 0;
                this.setDirection(this.beforeX, this.beforeY);
                this.beforeX = this.getPosition().x;
                this.beforeY = this.getPosition().y;
            }

            //歩く目的地を設定
            this.walkingDestinationCnt += 1;
            if (this.walkingDestinationCnt >= 10 * this.randSec) {
                this.randSec = this.game.getRandNumberFromRange(1, 20);
                this.walkingDestinationCnt = 0;
                //this.setDestinationToEnemy();
                this.setWalkingDestination();
            }



            this.moveToPositions(this.walkingDestination.x, this.walkingDestination.y);


/*
            if (this.creatureType == 2) {
                //追従するか、自由に動くかによってmoveのロジックが違う
                if (this.moveId == 1) {
                    this.moveToPositions(this.walkingDestination.x, this.walkingDestination.y);
                } else {
                    this.moveToPositions(this.walkingDestination.x, this.walkingDestination.y);
                }

            } else {
                //餌が存在する場合
                if (this.game.foods.length > 0) {
                    //最寄りの餌に向かって移動する
                    var _food = this.getCurrentFood();
                    if (_food != null) {
                        this.moveToPositions(_food.getPosition().x, _food.getPosition().y);
                    }
                } else {
                    //追従するか、自由に動くかによってmoveのロジックが違う
                    if (this.moveId == 1) {
                        //this.followToLeader();
                        this.moveToPositions(this.walkingDestination.x, this.walkingDestination.y);
                    } else {
                        this.moveToPositions(this.walkingDestination.x, this.walkingDestination.y);
                    }
                }
            }
*/

        }
        return true;
    },

    getPastSecond2: function() {
        var diffSecond = this.targetTime - parseInt(new Date() / 1000);
        return diffSecond;
    },

    addFlashCnt: function() {
        this.flashCnt++;
        if (this.flashCnt >= 10) {
            this.flashCnt = 0;
            if (this.isCharaVisible == true) {
                this.isCharaVisible = false;
                this.sprite.setOpacity(255 * 0.2);
            } else {
                this.isCharaVisible = true;
                this.sprite.setOpacity(255 * 1);
            }
        }
    },

    getHp: function() {
        if (this.targetTime > 0) {
            return 99999;
        }
        var hp = this.deadTime - parseInt(new Date() / 1000);
        if (hp < 0) {
            hp = 0;
        }
        return hp;
    },

    getCurrentFood: function() {
        this.targetFood = null;
        var _minDist = 99999;
        for (var e = 0; e < this.game.foods.length; e++) {
            var _distance = cc.pDistance(this.game.foods[e].getPosition(), this.getPosition());
            if (_minDist > _distance) {
                _minDist = _distance;
                this.targetFood = this.game.foods[e];
            }
        }
        return this.targetFood;
    },

    setDestination: function() {
        //4方向からランダムで決める
        var _rand = this.game.getRandNumberFromRange(1, 5);
        var dX = 0;
        var dY = 0;
        if (_rand == 1) {
            //右下
            this.walkingDestination.x = this.getPosition().x + 500;
            this.walkingDestination.y = this.getPosition().y - 500;
        }
        if (_rand == 2) {
            //左下
            this.walkingDestination.x = this.getPosition().x - 500;
            this.walkingDestination.y = this.getPosition().y - 500;
        }
        if (_rand == 3) {
            //左上
            this.walkingDestination.x = this.getPosition().x - 500;
            this.walkingDestination.y = this.getPosition().y + 500;
        }
        if (_rand == 4) {
            //右上
            this.walkingDestination.x = this.getPosition().x + 500;
            this.walkingDestination.y = this.getPosition().y + 500;
        }
    },

    shuffle: function() {
        return Math.random() - .5;
    },

    setDestinationToEnemy: function() {
        if(this.targetEnemy == null){
            var _rand = this.game.getRandNumberFromRange(0,this.game.enemies.length);
            this.targetEnemy = this.game.enemies[_rand];
            this.targetEnemy.markers.sort(this.shuffle);
            this.targetEnemy.markers.sort(this.shuffle);
            this.targetEnemy.markers.sort(this.shuffle);
            this.targetMarker = this.targetEnemy.markers[0];
        }
        if(this.targetEnemy){
            this.walkingDestination.x = this.targetEnemy.getPosition().x + this.targetMarker.getPosition().x;
            this.walkingDestination.y = this.targetEnemy.getPosition().y + this.targetMarker.getPosition().y;
        }
    },

    damage: function(damagePoint) {
        playSE(s_se_attack);
        this.hp = this.hp - damagePoint;
        if (this.hp < 0) {
            this.hp = 0;
        }
        this.isDamageOn = true;
    },

    getDirection: function() {
        return this.direction;
    },

    initSprite: function() {
        var frameSeq = [];
        for (var i = 0; i <= 1; i++) {
            var frame = cc.SpriteFrame.create(this.image, cc.rect(this.imgWidth * i, this.imgHeight * this.spriteNum, this.imgWidth, this.imgHeight));
            frameSeq.push(frame);
        }
        this.wa = cc.Animation.create(frameSeq, 0.2);
        this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
        this.sprite = cc.Sprite.create("res/ikimono-000-250.png", cc.rect(0, 0, this.imgWidth, this.imgHeight));
        this.sprite.runAction(this.ra);
        this.sprite.setAnchorPoint(0.5, 0);
        this.addChild(this.sprite);
        this.sprite.setScale(this.scaleRate, this.scaleRate);
/*
        this.timeSprite = cc.Sprite.create("res/ui_enemy_time.png");
        this.timeSprite.setPosition(0, -10);
        this.addChild(this.timeSprite);
        this.timeSprite.setVisible(false);

        this.timeLabel = new cc.LabelTTF("00:00:00", "Arial", 22);
        this.timeLabel.setFontFillColor(new cc.Color(255, 255, 255, 255));
        this.timeLabel.setAnchorPoint(1, 0);
        this.timeSprite.addChild(this.timeLabel);
        this.timeLabel.setAnchorPoint(0, 0);
        this.timeLabel.setPosition(20, 0);
*/
        this.deadSprite = cc.Sprite.create("res/ikimono-000-250.png", cc.rect(0, 0, this.imgWidth, this.imgHeight));
        this.addChild(this.deadSprite);
        this.deadSprite.setAnchorPoint(0.5, 0);
        this.deadSprite.setVisible(false);
        


        this.centerBase = cc.LayerColor.create(new cc.Color(255,0,255,255),10,10);
        this.centerBase.setPosition(0,0);
        this.addChild(this.centerBase);
        
    },

    followToLeader: function(leader) {
        //リーダーに追従する
        for (var e = 0; e < this.game.creatures.length; e++) {
            if (this.game.creatures[e].isLeader == true && this.game.creatures[e].eType == this.eType) {
                var dX = this.game.creatures[e].getPosition().x - this.getPosition().x;
                var dY = this.game.creatures[e].getPosition().y - this.getPosition().y;
                var rad = Math.atan2(dX, dY);
                var speedX = this.walkSpeed * Math.sin(rad);
                var speedY = this.walkSpeed * Math.cos(rad);
                this.setPosition(
                    this.getPosition().x + speedX,
                    this.getPosition().y + speedY
                );
            }
        }
    },

    moveTo: function(player) {
        this.jumpYDirect = "up";
        var dX = this.game.player.getPosition().x - this.getPosition().x;
        var dY = this.game.player.getPosition().y - this.getPosition().y;
        var rad = Math.atan2(dX, dY);
        var speedX = this.walkSpeed * Math.sin(rad);
        var speedY = this.walkSpeed * Math.cos(rad);
        this.setPosition(
            this.getPosition().x + speedX,
            this.getPosition().y + speedY
        );
    },

    moveToPositions: function(posX, posY, jumpType) {
        var dX = posX - this.getPosition().x;
        var dY = posY - this.getPosition().y;
        var rad = Math.atan2(dX, dY);
        var speedX = this.walkSpeed * Math.sin(rad);
        var speedY = this.walkSpeed * Math.cos(rad);
        this.setPosition(
            this.getPosition().x + speedX,
            this.getPosition().y + speedY
        );
    },

    setDirection: function(DX, DY) {
        //横の距離が大きいとき
        var diffX = Math.floor(this.getPosition().x - DX);
        var diffY = Math.floor(this.getPosition().y - DY);
        if (diffX > 0 && diffY > 0) {
            this.walkRightUp();
        }
        if (diffX > 0 && diffY < 0) {
            this.walkRightDown();
        }
        if (diffX < 0 && diffY > 0) {
            this.walkLeftUp();
        }
        if (diffX < 0 && diffY < 0) {
            this.walkLeftDown();
        }
    },

    walkLeftDown: function() {

        //return;
        if (this.direction != "front") {
            this.direction = "front";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i <= 1; i++) {
                var frame = cc.SpriteFrame.create(this.image, cc.rect(this.imgWidth * i, this.imgHeight * this.spriteNum, this.imgWidth, this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq, this.animationInterval);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
        this.sprite.setScale(this.scaleRate * 1, this.scaleRate * 1);
    },

    walkRightDown: function() {

        //return;
        if (this.direction != "left") {
            this.direction = "left";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i <= 1; i++) {
                var frame = cc.SpriteFrame.create(this.image, cc.rect(this.imgWidth * i, this.imgHeight * this.spriteNum, this.imgWidth, this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq, this.animationInterval);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
        this.sprite.setScale(this.scaleRate * -1, this.scaleRate * 1);
    },

    walkLeftUp: function() {

        //return;
        if (this.direction != "right") {
            this.direction = "right";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i <= 1; i++) {
                var frame = cc.SpriteFrame.create(this.image, cc.rect(this.imgWidth * i, this.imgHeight * this.spriteNum, this.imgWidth, this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq, this.animationInterval);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
        this.sprite.setScale(this.scaleRate * 1, this.scaleRate * 1);
    },

    walkRightUp: function() {

        //return;
        if (this.direction != "back") {
            this.direction = "back";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i <= 1; i++) {
                var frame = cc.SpriteFrame.create(this.image, cc.rect(this.imgWidth * i, this.imgHeight * this.spriteNum, this.imgWidth, this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq, this.animationInterval);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
        this.sprite.setScale(this.scaleRate * -1, this.scaleRate * 1);
    },

});