var item001Cnt = 0;
var isCancelAd = false;
var isFailedAd = false;

var GameLayer = cc.Layer.extend({
    sprite: null,
    ctor: function(storage) {
        this._super();

        //画面サイズの取得
        this.viewSize = cc.director.getVisibleSize();
        var size = cc.winSize;

        this.storage = storage;
        this.status = "gaming";

        this.score = 0;
        this.visibleScore = 0;

        this.foods = [];
        this.creatures = [];
        this.enemies = [];
        this.statusEffects = [];

        this.baseScale = 1;
        this.basePosition = new Object;
        this.basePosition.x = 0;
        this.basePosition.y = 0;
        this.targetBaseMarginY = 400;

        this.baseNode = cc.LayerColor.create(new cc.Color(245, 189, 61, 255), CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
        //this.baseNode = cc.Node.create();
        this.addChild(this.baseNode);
        this.baseNode.setScale(this.baseScale, this.baseScale);

        this.firstTouchX = 0;
        this.firstTouchY = 0;
        this.lastTouchGameLayerX = this.baseNode.getPosition().x;
        this.lastTouchGameLayerY = this.baseNode.getPosition().y;

        this.targetSprite = cc.Sprite.create("res/target.png");
        this.baseNode.addChild(this.targetSprite, 99999999999999);

        this.targetSprite2 = cc.Sprite.create("res/target.png");
        this.baseNode.addChild(this.targetSprite2, 99999999999999);

        this.header = new Header(this);
        this.addChild(this.header);

        this.cards = [];
        this.emotions = [];

        this.card001 = cc.Sprite.create("res/seed004.png");
        this.addChild(this.card001);
        this.card001.setPosition((this.viewSize.width - 20) - 106 * 1 + 106 / 2, 520 + 106 / 2);
        this.card001.creatureId = 4;
        this.cards.push(this.card001);

        this.card002 = cc.Sprite.create("res/seed003.png");
        this.addChild(this.card002);
        this.card002.setPosition((this.viewSize.width - 20) - 106 * 2 + 106 / 2, 520 + 106 / 2);
        this.card002.creatureId = 3;
        this.cards.push(this.card002);

        this.card003 = cc.Sprite.create("res/seed002.png");
        this.addChild(this.card003);
        this.card003.setPosition((this.viewSize.width - 20) - 106 * 3 + 106 / 2, 520 + 106 / 2);
        this.card003.creatureId = 2;
        this.cards.push(this.card003);

        this.card004 = cc.Sprite.create("res/seed001.png");
        this.addChild(this.card004);
        this.card004.setPosition((this.viewSize.width - 20) - 106 * 4 + 106 / 2, 520 + 106 / 2);
        this.card004.creatureId = 1;
        this.cards.push(this.card004);

        //touch
        this.firstTouchX = 0;
        this.firstTouchY = 0;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function(touches, event) {
                var location = touches[0].getLocation();
                event.getCurrentTarget().touchStart(touches[0].getLocation());
            },
            onTouchesMoved: function(touches, event) {
                var location = touches[0].getLocation();
                event.getCurrentTarget().touchMove(touches[0].getLocation());
            },
            onTouchesEnded: function(touches, event) {
                event.getCurrentTarget().touchFinish(touches[0].getLocation());
            }
        }), this);

        var stData = this.storage.creatureData;
        for (var key in stData) {
            if (stData.hasOwnProperty(key)) {
                var value = stData[key];
                var obj = JSON.parse(value);
                this.addLoadedCreature(obj);
            }
        }
        this.saveCnt = 0;
        this.isMovingCard = false;
        this.targetCard = null;

        this.targetCreature = null;
        this.scheduleUpdate();


        this.creatureAddCnt = 0;



        this.addEnemy(1,320,320);
        //this.addEnemy(1,520,320);

        this.foodCnt = 0;

        return true;
    },


    update: function(dt) {

        //スコア表示
        if(this.visibleScore < this.score){
            this.visibleScore += 1;
        }
        //this.scoreLabel.setString(this.visibleScore);
        //this.bestScoreLabel.setString(this.storage.maxGameScore);


        this.foodCnt++;
        if(this.foodCnt>=5*1 && this.foods.length <= 20){
            this.foodCnt = 0;
            var _x = this.getRandNumberFromRange(1,CONFIG.MAP_WIDTH);
            var _y = this.getRandNumberFromRange(1,CONFIG.MAP_HEIGHT);
            this.addFood(_x, _y, 1);
        }

        //emotion
        for (var e = 0; e < this.emotions.length; e++) {
            if (this.emotions[e].update() == false) {
                this.baseNode.removeChild(this.emotions[e]);
                this.emotions.splice(e, 1);
            }
        }

        //flush
        if (this.targetCreature != null) {
            this.targetCreature.isFlush = true;
        }

        //this.effectsをupdateする
        for (var e = 0; e < this.statusEffects.length; e++) {
            if (this.statusEffects[e].update() == false) {
                this.baseNode.removeChild(this.statusEffects[e]);
                this.statusEffects.splice(e, 1);
            }
        }

        //指のアイコンを出す
        if (this.targetCreature != null) {
            this.targetSprite.setPosition(this.targetCreature.getPosition().x, this.targetCreature.getPosition().y - 10);
            this.targetSprite.setVisible(true);
        } else {
            this.targetSprite.setVisible(false);
        }

        //バックアップのcntをあげる
        this.saveCnt++;

        //Creatureをupdateする
        for (var e = 0; e < this.creatures.length; e++) {
            this.reorderChild(
                this.creatures[e],
                99999999 - this.creatures[e].getPosition().y
            );
            if (this.creatures[e].update() == false) {
                this.baseNode.removeChild(this.creatures[e]);
                this.creatures.splice(e, 1);
            }
            /*
            //定期的にバックアップを行う
            if (this.saveCnt >= 30 * 10) {
                this.saveCnt = 0;
                for (var e = 0; e < this.creatures.length; e++) {
                    this.creatures[e].save();
                }
            }
            */
        }

        //enemyをupdateする
        for (var e = 0; e < this.enemies.length; e++) {
            this.reorderChild(
                this.enemies[e],
                99999999 - this.enemies[e].getPosition().y
            );
            if (this.enemies[e].update() == false) {
                this.baseNode.removeChild(this.enemies[e]);
                this.enemies.splice(e, 1);
            }
        }

        for (var c = 0; c < this.creatures.length; c++) {
            for (var e = 0; e < this.enemies.length; e++) {
                var distance = cc.pDistance(this.creatures[c].getPosition(), this.enemies[e].getPosition());
                if (distance <= 150) {
                    this.creatures[c].isBattle = true;
                }
            }
        }

        //foodをupdateする
        for (var e = 0; e < this.foods.length; e++) {
            if (this.foods[e].update() == false) {
                this.baseNode.removeChild(this.foods[e]);
                this.foods.splice(e, 1);
            }
        }

        //animalとfoodのcollision
        for (var i = 0; i < this.creatures.length; i++) {
            for (var j = 0; j < this.foods.length; j++) {
                if (this.creatures[i].creatureType != 2) {
                    var distance = cc.pDistance(this.creatures[i].getPosition(), this.foods[j].getPosition());
                    if (distance <= 40) {
                        this.creatures[i].eat();
                        this.foods[j].hp = 0;
                    }
                }
            }
        }

        //collision
        for (var j = 0; j < this.creatures.length; j++) {
            var colleagueOne = this.creatures[j];
            for (var k = 0; k < this.creatures.length; k++) {
                var colleagueTwo = this.creatures[k];

                if (j != k) {
                    var distance = cc.pDistance(colleagueOne.getPosition(), colleagueTwo.getPosition());

                    //ノックバック
                    if (distance < 25 && colleagueTwo.isMove == true) {
                        var diffX = colleagueTwo.getPosition().x - colleagueOne.getPosition().x;
                        var diffY = colleagueTwo.getPosition().y - colleagueOne.getPosition().y;
                        if (diffX > 0) {
                            colleagueTwo.setPosition(
                                colleagueTwo.getPosition().x + colleagueTwo.walkSpeed,
                                colleagueTwo.getPosition().y
                            );
                        }
                        if (diffX < 0) {
                            colleagueTwo.setPosition(
                                colleagueTwo.getPosition().x - colleagueTwo.walkSpeed,
                                colleagueTwo.getPosition().y
                            );
                        }
                        if (diffY > 0) {
                            colleagueTwo.setPosition(
                                colleagueTwo.getPosition().x,
                                colleagueTwo.getPosition().y + colleagueTwo.walkSpeed
                            );
                        }
                        if (diffY < 0) {
                            colleagueTwo.setPosition(
                                colleagueTwo.getPosition().x,
                                colleagueTwo.getPosition().y - colleagueTwo.walkSpeed
                            );
                        }
                    }

                    if (colleagueTwo.getPosition().x <= 0) {
                        colleagueTwo.setPosition(
                            colleagueTwo.getPosition().x + colleagueTwo.walkSpeed,
                            colleagueTwo.getPosition().y
                        );
                    }
                    if (colleagueTwo.getPosition().x >= CONFIG.MAP_WIDTH) {
                        colleagueTwo.setPosition(
                            colleagueTwo.getPosition().x - colleagueTwo.walkSpeed,
                            colleagueTwo.getPosition().y
                        );
                    }
                    if (colleagueTwo.getPosition().y <= 0) {
                        colleagueTwo.setPosition(
                            colleagueTwo.getPosition().x,
                            colleagueTwo.getPosition().y + colleagueTwo.walkSpeed
                        );
                    }
                    if (colleagueTwo.getPosition().y >= CONFIG.MAP_HEIGHT) {
                        colleagueTwo.setPosition(
                            colleagueTwo.getPosition().x,
                            colleagueTwo.getPosition().y - colleagueTwo.walkSpeed
                        );
                    }
                }
            }
        }
    },

    addFood: function(x, y, typeId) {
        this.food = new Food(this, x, y, typeId);
        this.baseNode.addChild(this.food);
        this.foods.push(this.food);
    },

    addStatusEffect: function(posX, posY, effectType) {
        this.effect = new StatusEffect(
            this, posX, posY, effectType
        );
        this.baseNode.addChild(this.effect, 999999999999);
        this.statusEffects.push(this.effect);
    },

    getRandNumberFromRange: function(min, max) {
        var rand = min + Math.floor(Math.random() * (max - min));
        return rand;
    },

    addNewCreature: function(creatureId, x, y, isSeed) {
        var id = this.getRandNumberFromRange(0, 999999999);
        this.creature = new Creature(this, id, creatureId);
        this.baseNode.addChild(this.creature);
        this.creatures.push(this.creature);
        this.creature.setPosition(x, y);

        //生物IDごとによるパラメーター
        var creatureData = CONFIG.CREATURE[creatureId];
        this.creature.image = creatureData["image"];
        this.creature.name = creatureData["name"];
        this.creature.spriteNum = creatureData["spriteNum"];
        this.creature.isMove = creatureData["isMove"];
        this.creature.scaleRate = creatureData["scale"];
        this.creature.walkSpeed = creatureData["speed"];
        this.creature.imgWidth = creatureData["width"];
        this.creature.imgHeight = creatureData["height"];
        this.creature.creatureType = creatureData["creatureType"];

        //固有のパラメーター
        this.creature.id = id;
        this.creature.creatureId = creatureId;
        this.creature.status = "normal";
        this.creature.age = 100;
        this.creature.foodCnt = 0;
        this.creature.generation = 1;
        this.creature.statusHash = "000010110010";
        this.creature.deadTime = parseInt(new Date() / 1000) + creatureData["deadTime"];
        if (isSeed == true) {
            this.creature.setTargetTime();
        } else {
            this.creature.targetTime = 0;
        }
        this.creature.lastUpdatedTime = 0;

        //他に自分と同じ種別がいなければ自分がleaderになる
        var _leaderCnt = 0;
        for (var e = 0; e < this.creatures.length; e++) {
            if (this.creatures[e].isLeader == true && this.creatures[e].creatureId == creatureId) {
                _leaderCnt += 1;
            }
        }
        if (_leaderCnt == 0) {
            this.creature.isLeader = true;
        }
    },

    addLoadedCreature: function(obj) {
        this.creature = new Creature(this, obj.id, obj.creatureId);
        this.baseNode.addChild(this.creature);
        this.creatures.push(this.creature);
        this.creature.setPosition(obj.x, obj.y);

        //生物IDごとによるパラメーター
        var creatureData = CONFIG.CREATURE[creatureId];
        this.creature.image = creatureData["image"];
        this.creature.name = creatureData["name"];
        this.creature.spriteNum = creatureData["spriteNum"];
        this.creature.isMove = creatureData["isMove"];
        this.creature.scaleRate = creatureData["scale"];
        this.creature.walkSpeed = creatureData["speed"];
        this.creature.imgWidth = creatureData["width"];
        this.creature.imgHeight = creatureData["height"];
        this.creature.creatureType = creatureData["creatureType"];

        //固有のパラメーター
        this.creature.id = obj.id;
        this.creature.creatureId = obj.creatureId;
        this.creature.status = obj.status;
        this.creature.age = obj.age;
        this.creature.foodCnt = obj.foodCnt;
        this.creature.generation = obj.generation;
        this.creature.statusHash = obj.statusHash;
        this.creature.deadTime = obj.deadTime;
        this.creature.targetTime = obj.targetTime;
        this.creature.lastUpdatedTime = obj.lastUpdatedTime;

        //他に自分と同じ種別がいなければ自分がleaderになる
        var _leaderCnt = 0;
        for (var e = 0; e < this.creatures.length; e++) {
            if (this.creatures[e].isLeader == true && this.creatures[e].creatureId == obj.creatureId) {
                _leaderCnt += 1;
            }
        }
        if (_leaderCnt == 0) {
            this.creature.isLeader = true;
        }
    },

    addEnemy: function(enemyId, x, y ) {

        var id = this.getRandNumberFromRange(0, 999999999);
        this.enemy = new Enemy(this, id, enemyId);
        this.baseNode.addChild(this.enemy);
        this.enemies.push(this.enemy);
        this.enemy.setPosition(x, y);

        //生物IDごとによるパラメーター
        var enemyData = CONFIG.ENEMY[enemyId];
        this.enemy.image = enemyData["image"];
        this.enemy.name = enemyData["name"];
        this.enemy.spriteNum = enemyData["spriteNum"];
        this.enemy.isMove = enemyData["isMove"];
        this.enemy.scaleRate = enemyData["scale"];
        this.enemy.walkSpeed = enemyData["speed"];
        this.enemy.imgWidth = enemyData["width"];
        this.enemy.imgHeight = enemyData["height"];
        this.enemy.creatureType = enemyData["creatureType"];

        //固有のパラメーター
        this.enemy.id = id;
        this.enemy.enemyId = enemyId;
        this.enemy.status = "normal";
        this.enemy.age = 100;
        this.enemy.foodCnt = 0;
        this.enemy.generation = 1;
        this.enemy.statusHash = "000010110010";
        this.enemy.deadTime = parseInt(new Date() / 1000) + enemyData["deadTime"];
        this.enemy.targetTime = 0;
        /*
        if (isSeed == true) {
            this.enemy.setTargetTime();
        } else {
            this.enemy.targetTime = 0;
        }
        this.enemy.lastUpdatedTime = 0;
        */
    },


    shuffle: function() {
        return Math.random() - .5;
    },

    touchStart: function(location) {
        this.firstTouchX = location.x;
        this.firstTouchY = location.y;
        var touchX = location.x - this.lastTouchGameLayerX;
        var touchY = location.y - this.lastTouchGameLayerY;

        this.targetSprite.setPosition(touchX, touchY);
        this.targetSprite2.setPosition(touchX, touchY);

        this.tmpTargetCreature = null;
        var _minDist = 70;
        for (var e = 0; e < this.creatures.length; e++) {
            var _distance = cc.pDistance(this.creatures[e].getPosition(), this.targetSprite.getPosition());
            if (_minDist > _distance) {
                _minDist = _distance;
                this.tmpTargetCreature = this.creatures[e];
            }
        }

        if (this.tmpTargetCreature != null) {
            if (this.targetCreature == this.tmpTargetCreature) {
                //enemyの動作を発動する
                //死亡時には食料を撒き散らす
                if (this.targetCreature.status == "dead") {
                    //this.addFood(this.targetCreature.getPosition().x, this.targetCreature.getPosition().y, 1);
                    this.targetCreature.status = "remove";
                }
                //レベルアップ準備完了時にはレベルアップを促す
                if (this.targetCreature.isPreparedLevelUp() == true) {
                    this.targetCreature.setTargetTime();
                }
            } else {
                this.targetCreature = this.tmpTargetCreature;
            }
        } else {
            this.targetCreature = null;
        }

        //カードの選択に関する制御
        for (var c = 0; c < this.cards.length; c++) {
            if (this.cards[c].getPosition().x - 50 <= location.x && location.x <= this.cards[c].getPosition().x + 50 && this.cards[c].getPosition().y - 50 <= location.y && location.y <= this.cards[c].getPosition().y + 50) {
                //cc.log("fetch");
                this.isMovingCard = true;
                this.targetCard = this.cards[c];
            }
        }
    },

    touchMove: function(location) {
        if (this.isMovingCard == false) {
            this.targetSprite.setPosition(location.x, location.y);
            var scrollX = this.firstTouchX - location.x;
            var scrollY = this.firstTouchY - location.y;
            var x = this.lastTouchGameLayerX - scrollX;
            var y = this.lastTouchGameLayerY - scrollY;
            var _limitX = (CONFIG.MAP_WIDTH - this.viewSize.width) * -1;
            var _limitY = (CONFIG.MAP_HEIGHT - this.viewSize.height) * -1;
            if (_limitX <= x && x <= 0 && _limitY <= y && y <= 0) {
                this.baseNode.setPosition(x, y);
            }
        }

        var touchX = location.x - this.lastTouchGameLayerX;
        var touchY = location.y - this.lastTouchGameLayerY;
        if (this.isMovingCard == true) {
            this.targetSprite2.setVisible(true);
            this.targetSprite2.setPosition(touchX, touchY);
        } else {
            this.targetSprite2.setVisible(false);
        }
    },

    touchFinish: function(location) {
        this.targetSprite.setPosition(location.x, location.y);
        this.lastTouchGameLayerX = this.baseNode.getPosition().x;
        this.lastTouchGameLayerY = this.baseNode.getPosition().y;
        var touchX = location.x - this.lastTouchGameLayerX;
        var touchY = location.y - this.lastTouchGameLayerY;
        if (this.isMovingCard == true) {
            var _creatureId = this.targetCard.creatureId;
            this.addNewCreature(_creatureId, touchX, touchY, true);
        }
        this.targetSprite2.setVisible(false);
        this.isMovingCard = false;
    },

    getRandNumberFromRange: function(min, max) {
        var rand = min + Math.floor(Math.random() * (max - min));
        return rand;
    },

    //シーンの切り替え----->
    goToTopLayer: function(pSender) {
        var scene = cc.Scene.create();
        //次のステージへいくためにstorageは必ず受けた渡す
        scene.addChild(TopLayer.create(this.storage));
        cc.director.runScene(cc.TransitionFade.create(1.5, scene));
    },

    //シーンの切り替え----->
    goToStageLayer: function(pSender) {
        var scene = cc.Scene.create();
        //次のステージへいくためにstorageは必ず受けた渡す
        scene.addChild(GameLayer.create(this.storage, [], 0));
        cc.director.runScene(cc.TransitionFade.create(1.5, scene));
    },

    showInfo: function(text) {
        console.log(text);
        if (this.infoLabel) {
            var lines = this.infoLabel.string.split('\n');
            var t = '';
            if (lines.length > 0) {
                t = lines[lines.length - 1] + '\n';
            }
            t += text;
            this.infoLabel.string = t;
        }
    },

    admobInit: function() {
        if ('undefined' == typeof(sdkbox)) {
            isFailedAd = true;
            this.showInfo('sdkbox is undefined')
            return;
        }
        if ('undefined' == typeof(sdkbox.PluginAdMob)) {
            isFailedAd = true;
            this.showInfo('sdkbox.PluginAdMob is undefined')
            return;
        }

        var self = this
        sdkbox.PluginAdMob.setListener({
            adViewDidReceiveAd: function(name) {
                self.showInfo('adViewDidReceiveAd name=' + name);
            },
            adViewDidFailToReceiveAdWithError: function(name, msg) {
                self.showInfo('adViewDidFailToReceiveAdWithError name=' + name + ' msg=' + msg);
            },
            adViewWillPresentScreen: function(name) {
                self.showInfo('adViewWillPresentScreen name=' + name);
            },
            adViewDidDismissScreen: function(name) {
                isCancelAd = true;
                self.showInfo('adViewDidDismissScreen name=' + name);
            },
            adViewWillDismissScreen: function(name) {
                self.showInfo('adViewWillDismissScreen=' + name);
            },
            adViewWillLeaveApplication: function(name) {
                self.showInfo('adViewWillLeaveApplication=' + name);
                if (name == "gameover") {
                    sdkbox.PluginAdMob.hide("gameover");
                    item001Cnt = 1;
                }
            }
        });
        sdkbox.PluginAdMob.init();
        // just for test
        var plugin = sdkbox.PluginAdMob
        if ("undefined" != typeof(plugin.deviceid) && plugin.deviceid.length > 0) {
            this.showInfo('deviceid=' + plugin.deviceid);
            // plugin.setTestDevices(plugin.deviceid);
        }
    },
});

GameLayer.create = function(storage) {
    return new GameLayer(storage);
};

var GameLayerScene = cc.Scene.extend({
    onEnter: function(storage) {
        this._super();
        var layer = new GameLayer(storage);
        this.addChild(layer);
    }
});

//
//  Marker.js
//
//  Created by Fumitoshi Ogata on 10/10/15.
//  Copyright (c) 2015 http://oggata.github.io All rights reserved.
//

var Header = cc.Node.extend({
    ctor: function(game) {
        this._super();
        this.game = game;

        this.back2 = cc.Sprite.create("res/back2.png");
        this.back2.setAnchorPoint(0, 0);
        this.back2.setPosition(0, this.game.viewSize.height - 220);
        this.addChild(this.back2);
        /*
                this.back3 = cc.Sprite.create("res/back_card.png");
                this.back3.setAnchorPoint(0, 0);
                this.back3.setPosition(300, this.game.viewSize.height - 111);
                this.addChild(this.back3);
        */

        this.scoreLabel = new cc.LabelTTF("", "Arial", 50);
        this.scoreLabel.setFontFillColor(new cc.Color(255, 191, 0, 255));
        this.scoreLabel.setAnchorPoint(1, 0);
        this.addChild(this.scoreLabel);
        this.scoreLabel.setPosition(255, this.game.viewSize.height - 70 - 15 * 1);

        this.maxScoreLabel = new cc.LabelTTF("", "Arial", 28);
        this.maxScoreLabel.setFontFillColor(new cc.Color(255, 191, 0, 255));
        this.maxScoreLabel.setAnchorPoint(1, 0);
        this.addChild(this.maxScoreLabel);
        this.maxScoreLabel.setPosition(185, this.game.viewSize.height - 70 - 35 * 2 - 7);
    },
    init: function() {},

    update: function() {
        return true;
    },
});

var Gauge = cc.Node.extend({
    ctor: function(width, height, color) {
        this._super();
        this.width = width;
        this.height = height;

        this.rectBase = cc.LayerColor.create(new cc.Color(0, 0, 0, 255), this.width, this.height);
        this.rectBase.setPosition(0, 0);
        this.addChild(this.rectBase, 1);

        this.rectBack = cc.LayerColor.create(new cc.Color(105, 105, 105, 255), this.width - 1, this.height - 1);
        this.rectBack.setPosition(1, 1);
        this.addChild(this.rectBack, 2);

        var colorCode = new cc.Color(255, 255, 255, 255);
        if (color == "red") {
            colorCode = new cc.Color(178, 34, 34, 255);
        }
        if (color == "blue") {
            colorCode = new cc.Color(255, 255, 255, 255);
        }
        if (color == "lime") {
            colorCode = new cc.Color(128, 128, 0, 255);
        }
        if (color == "white") {
            colorCode = new cc.Color(255, 255, 255, 255);
        }
        this.rectBar = cc.LayerColor.create(colorCode, this.width - 2, this.height - 2);
        this.rectBar.setPosition(2, 2);
        this.addChild(this.rectBar, 3);
        this.rectBar.setAnchorPoint(0, 0);
    },
    init: function() {},
    update: function(scaleNum) {
        this.rectBar.setScale(scaleNum, 1);
    },
    setVisible: function(isVisible) {
        this.rectBase.setVisible(isVisible);
        this.rectBack.setVisible(isVisible);
        this.rectBar.setVisible(isVisible);
    }
});