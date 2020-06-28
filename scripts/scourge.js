var totalSegments = 21;

var segmentOffset = 50;

const tempVec = new Vec2();
const tempVecB = new Vec2();

const segmentBullet = new BasicBulletType(8, 17, "shell");
segmentBullet.lifetime = 30;
segmentBullet.bulletWidth = 10;
segmentBullet.bulletHeight = 15;
segmentBullet.bulletShrink = 0.1;
segmentBullet.keepVelocity = false;
segmentBullet.frontColor = Pal.missileYellow;
segmentBullet.backColor = Pal.missileYellowBack;

//const scourgeBullet = BasicBulletType(7, 40, "shell");
const scourgeBullet = extend(BasicBulletType, {
	update(b){
		this.super$update(b);
		
		b.velocity().rotate(Mathf.sin(Time.time() + b.id * 4422, this.weaveScale, this.weaveMag) * Time.delta());
	}
});
scourgeBullet.speed = 7;
scourgeBullet.damage = 40;
scourgeBullet.bulletSprite = "shell";
scourgeBullet.weaveScale = 12;
scourgeBullet.weaveMag = 6;
scourgeBullet.homingPower = 1;
scourgeBullet.homingRange = 60;
scourgeBullet.splashDamage = 30;
scourgeBullet.splashDamageRadius = 20;
scourgeBullet.hitEffect = Fx.hitMeltdown;
scourgeBullet.despawnEffect = Fx.none;
scourgeBullet.hitSize = 4;
scourgeBullet.lifetime = 30;
scourgeBullet.pierce = true;
scourgeBullet.bulletWidth = 12;
scourgeBullet.bulletHeight = 21;
scourgeBullet.bulletShrink = 0.1;
//scourgeBullet.keepVelocity = false;
scourgeBullet.frontColor = Pal.missileYellow;
scourgeBullet.backColor = Pal.missileYellowBack;

const scourgeSegment = prov(() => {
	scourgeSegmentB = extend(FlyingUnit, {
		update(){
			if((this.getParentUnit() == null || (this.getParentUnit().isDead() && this.getParentUnit() != null)) && !this.isDead()){
				//this.kill();
				this.remove();
			};
			
			if(this.isDead()){
				this.remove();
				return;
			};
			
			this.health = this.getTrueParentUnit().health();
			
			if(Vars.net.client()){
				this.interpolate();
				this.status.update(this);
				return;
			};
			
			this.updateTargeting();
			
			this.state.update();
			//this.updateVelocityStatus();
			
			if(this.target != null) this.behavior();
			
			//this.super$update();
			
			//this.updateRotation();
			
			//this.updatePosition();
		},
		
		isDead(){
			if(this.getParentUnit() == null) return true;
			return this.getParentUnit().isDead();
		},
		
		drawSize(){
			if(!this.getDrawerUnit()) return this.getType().hitsize * 10;
			return (segmentOffset * totalSegments) * 2;
		},
		
		drawCustom(){
			this.super$drawAll();
			
			if(this.getParentUnit() == null) return;
			
			this.getParentUnit().drawCustom();
		},
		
		drawAll(){
			if(this.getDrawerUnit()){
				this.drawCustom();
			};
		},
		
		updateCustom(){
			if(this.getTrueParentUnit() != null){
				this.hitTime = this.getTrueParentUnit().getHitTime();
			};
			
			this.updateRotation();
			
			this.updatePosition();
			
			this.updateVelocityStatus();
			
			if(this.getChildUnit() == null) return;
			
			this.getChildUnit().updateCustom();
		},
		
		damage(amount){
			if(this.getTrueParentUnit() == null) return;
			this.getTrueParentUnit().damage(amount);
		},
		
		healBy(amount){
			if(this.getTrueParentUnit() == null) return;
			this.getTrueParentUnit().healBy(amount);
		},
		
		setChildUnit(a){
			this._childUnit = a;
		},
		
		getDrawerUnit(){
			return this._drawer;
		},
		
		setDrawerUnit(a){
			this._drawer = a;
		},
		
		getChildUnit(){
			if(this._childUnit != null && this._childUnit instanceof Number){
				if(this._childUnit == -1){
					this._childUnit = null;
					return null;
				};
				this.setChildUnit(Vars.unitGroup.getByID(this._childUnit));
			};
			
			return this._childUnit;
		},
		
		setParentUnit(a){
			this._parentUnit = a;
		},
		
		setTrueParentUnit(a){
			this._trueParentUnit = a;
		},
		
		getParentUnit(){
			if(this._parentUnit != null && this._parentUnit instanceof Number){
				if(this._parentUnit == -1){
					this._parentUnit = null;
					return null
				};
				this.setTrueParentUnit(Vars.unitGroup.getByID(this._parentUnit));
			};
			
			return this._parentUnit;
		},
		
		getTrueParentUnit(){
			if(this._trueParentUnit != null && this._trueParentUnit instanceof Number){
				if(this._trueParentUnit == -1){
					this._trueParentUnit = null;
					return null
				};
				this.setTrueParentUnit(Vars.unitGroup.getByID(this._trueParentUnit));
			};
			
			return this._trueParentUnit;
		},
		
		drawWeapons(){
			for(var s = 0; s < 2; s++){
				sign = Mathf.signs[s];
				var tra = this.rotation - 90;
				var trY = -this.type.weapon.getRecoil(this, sign > 0) + this.type.weaponOffsetY;
				var w = -sign * this.type.weapon.region.getWidth() * Draw.scl;
				
				Draw.rect(this.type.weapon.region,
				this.x + Angles.trnsx(tra, this.getWeapon().width * sign, trY),
				this.y + Angles.trnsy(tra, this.getWeapon().width * sign, trY), w, this.type.weapon.region.getHeight() * Draw.scl, this.weaponAngles[s] - 90);
			}
		},
		
		drawUnder(){
		},
		
		/*updatePosition(){
			if(this.getParentUnit() == null) return;
			var parentB = this.getParentUnit();
			
			tempVecB.trns(this.rotation, segmentOffset / 2);
			tempVecB.add(this.x, this.y);
			tempVec.trns(this.getParentUnit().rotation - 180, segmentOffset / 2);
			//tempVec.trns(parentB.velocity().angle() - 180, segmentOffset / 2);
			tempVec.add(parentB.x, parentB.y);
			
			var dst = Mathf.dst(tempVecB.x, tempVecB.y, tempVec.x, tempVec.y);
			
			var angle = Angles.angle(tempVecB.x, tempVecB.y, tempVec.x, tempVec.y);
			
			tempVec.setZero();
			tempVecB.setZero();
			
			tempVec.trns(angle, dst);
			//tempVecB.set(tempVec);
			//tempVecB.scl(0.5);
			//tempVecB.limit(1);
			
			//this.velocity().add(tempVecB.x, tempVecB.y);
			
			tempVec.add(this.x, this.y);
			
			this.set(tempVec.x, tempVec.y);
			
			tempVec.setZero();
			//tempVecB.setZero()
		},*/
		
		updatePosition(){
			if(this.getParentUnit() == null || this.getTrueParentUnit() == null) return;
			
			//this.updatePositionAlt();
			
			var parentB = this.getParentUnit();
			
			var dst = Mathf.dst(this.x, this.y, parentB.x, parentB.y) - segmentOffset;
			
			//tempVecB.trns(parentB.velocity().angle() + 180, segmentOffset / 2);
			
			var angle = Angles.angle(this.x, this.y, parentB.x, parentB.y);
			//var angleB = Angles.angle(this.x, this.y, parentB.x, parentB.y);
			//tempVec.trns(angle, dst);
			var vel = this.velocity();
			
			if(!Mathf.within(this.x, this.y, parentB.x, parentB.y, segmentOffset)){
				//this.velocity().trns(angle, dst);
				//var vel = this.velocity();
				tempVec.trns(angle, dst);
				
				tempVecB.trns(angle, parentB.velocity().len());
				
				//vel.add(tempVec.x, tempVec.y);
				vel.add(tempVecB.x, tempVecB.y);
				if(Mathf.within(this.x + vel.x, this.y + vel.y, parentB.x, parentB.y, segmentOffset)){
					//vel.sub(tempVec.x, tempVec.y);
					this.moveBy(-tempVec.x, -tempVec.y);
				};
				//this.moveBy(tempVec.x, tempVec.y);
				this.moveBy(tempVec.x, tempVec.y);
				//this.velocity().trns(angle, this.getTrueParentUnit().velocity().len());
			};
			dst = Mathf.dst(this.x, this.y, parentB.x, parentB.y) - segmentOffset;
			if(dst < 0){
				angle = Angles.angle(this.x, this.y, parentB.x, parentB.y);
				tempVec.trns(angle, dst);
				//vel.add(tempVec.x, tempVec.y);
				this.moveBy(tempVec.x / 4, tempVec.y / 4);
			};
		},
		
		/*updatePositionAlt(){
			var parentB = this.getParentUnit();
			
			tempVecB.trns(parentB.velocity().angle() - 180, segmentOffset / 2);
			tempVecB.add(parentB.x, parentB.y);
			
			tempVec.trns(this.rotation, segmentOffset / 2);
			tempVec.add(this.x, this.y);
			
			var dst1 = Mathf.dst(tempVec.x, tempVec.y, tempVecB.x, tempVecB.y) / Time.delta();
			var angle1 = Angles.angle(tempVec.x, tempVec.y, tempVecB.x, tempVecB.y);
			
			tempVec.trns(parentB.velocity().angle() - 180, segmentOffset / 2);
			tempVec.add(parentB.x, parentB.y);
			
			var angle2 = Angles.angle(this.x, this.y, tempVec.x, tempVec.y);
			
			//var angle3 = Angles.angle(this.x, this.y, parentB.x, parentB.y);
			
			this.velocity().trns(angle2, parentB.velocity().len());
			
			if(dst1 > 0.002){
				
				if(Angles.near(angle1, this.velocity().angle(), 12)){
					this.velocity().trns(angle1, parentB.velocity().len() + dst1);
				};
				
				//tempVec.trns(angle1, dst1);
				//tempVec.trns(parentB.velocity().len() - 180, segmentOffset / 2);
				//tempVec.add(parentB.x, parentB.y);
				//tempVecB.trns(this.rotation - 180, segmentOffset / 2);
				//tempVec.add(tempVecB);
				//this.set(tempVec.x, tempVec.y);
				//this.moveBy(tempVec.x, tempVec.y);
			};
			tempVec.setZero();
			tempVecB.setZero();
		},*/
		
		updateRotation(){
			if(this.getParentUnit() == null) return;
			tempVec.trns(this.getParentUnit().rotation - 180, (segmentOffset / 4));
			tempVec.add(this.getParentUnit().x, this.getParentUnit().y);
			//tempVec.set(this.getParentUnit().x, this.getParentUnit().y);
			this.rotation = Angles.angle(this.x, this.y, tempVec.x, tempVec.y);
			tempVec.setZero();
		},
		
		/*added(){
			this.super$added();
			
			this.repairItself();
		},*/
	});
	//scourgeSegmentB.repaired = false;
	//scourgeSegmentB.parentID = -1;
	scourgeSegmentB.setDrawerUnit(false);
	scourgeSegmentB.setParentUnit(null);
	scourgeSegmentB.setTrueParentUnit(null);
	scourgeSegmentB.setChildUnit(null);
	return scourgeSegmentB;
});

const scourgeMain = prov(() => {
	scourgeMainB = extend(FlyingUnit, {
		update(){
			this.super$update();
			
			if(this.getChildUnit() != null) this.getChildUnit().updateCustom();
			//print(this.health() + "/" + this.maxHealth());
		},
		
		added(){
			this.super$added();
			
			//if(!this.loaded) this.trueHealth = this.getType().health * totalSegments;
			
			if(/*!this.loaded*/ true){
				this.trueHealth = this.getType().health * totalSegments;
				var parent = this;
				for(var i = 0; i < totalSegments; i++){
					type = i < totalSegments - 1 ? scourgeUnitSegment : scourgeUnitTail;
					
					base = type.create(this.getTeam());
					base.setParentUnit(parent);
					base.setTrueParentUnit(this);
					base.setDrawerUnit(type == scourgeUnitTail);
					base.add();
					//base.set(this.x + Mathf.random(12), this.y + Mathf.random(12));
					//print(this.rotation);
					tempVec.trns(this.rotation + 180, (segmentOffset * i));
					base.set(this.x + tempVec.y, this.y + tempVec.y);
					base.rotation = this.rotation;
					parent.setChildUnit(base);
					parent = base;
				}
			};
		},
		
		getHitTime(){
			return this.hitTime;
		},
		
		calculateDamage(amount){
			return (amount / (totalSegments / 2)) * Mathf.clamp(1 - this.status.getArmorMultiplier() / 100);
		},
		
		/*health(){
			var healthTotal = 0;
			var child = this;
			for(var i = 0; i < totalSegments; i++){
				//if(child == null) break;
				healthTotal += child.health;
				child = child.getChildUnit();
				if(child == null) break;
			};
			
			return healthTotal;
			//print(this.health() + "/" + this.maxHealth());
		},
		
		maxHealth(){
			var healthTotal = 0;
			var child = this;
			for(var i = 0; i < totalSegments; i++){
				//if(child == null) break;
				healthTotal += this.getType().health;
				//child = child.getChildUnit();
				//if(child == null) break;
			};
			
			return healthTotal * Vars.state.rules.unitHealthMultiplier;
		},*/
		
		drawCustom(){
			this.drawAll();
		},
		
		drawUnder(){
		},
		
		/*maxHealth(){
			return this.getType().health * totalSegments * Vars.state.rules.unitHealthMultiplier;
		},*/
		
		getParentUnit(){
			return null;
		},
		
		setChildUnit(a){
			this._childUnit = a;
		},
		
		getChildUnit(){
			if(this._childUnit != null && this._childUnit instanceof Number){
				if(this._childUnit == -1){
					this._childUnit = null;
					return null;
				};
				
				this.setChildUnit(Vars.unitGroup.getByID(this._childUnit));
			};
			
			return this._childUnit;
		}
		
		/*writeSave(stream){
			this.writeSave(stream, false);
			stream.writeByte(this.type.id);
			stream.writeInt(this.spawner);
			stream.writeFloat(this.health);
		},
		
		readSave(stream, version){
			this.super$readSave(stream, version);
			var trueHealth = stream.readFloat();
			
			this.health = trueHealth;
		},
		
		write(data){
			this.super$write(data);
			data.writeFloat(this.health);
		},
		
		read(data){
			this.super$readSave(data, this.version());
			var trueHealth = data.readFloat();
			
			this.health = trueHealth;
		}*/
	});
	//scourgeMainB.trueHealth = 0;
	scourgeMainB.setChildUnit(null);
	return scourgeMainB;
})

const scourgeSegWeap = extendContent(Weapon, "scourge-segment-equip", {
	load(){
		this.region = Core.atlas.find("advancecontent-scourge-segment-equip");
	}
});

scourgeSegWeap.reload = 9;
scourgeSegWeap.alternate = true;
scourgeSegWeap.length = 8;
scourgeSegWeap.width = 19;
scourgeSegWeap.ignoreRotation = true;
scourgeSegWeap.bullet = segmentBullet;
scourgeSegWeap.shootSound = Sounds.shootSnap;

const scourgeHeadWeap = extendContent(Weapon, "scourge-head-equip", {});

scourgeHeadWeap.reload = 25;
scourgeHeadWeap.alternate = true;
scourgeHeadWeap.spacing = 4;
scourgeHeadWeap.shots = 15;
scourgeHeadWeap.length = 16;
scourgeHeadWeap.width = 0;
scourgeHeadWeap.ignoreRotation = false;
scourgeHeadWeap.bullet = scourgeBullet;
scourgeHeadWeap.shootSound = Sounds.artillery;

const scourgeUnitTail = extendContent(UnitType, "scourge-tail", {
	isHidden(){
		return true;
	}
});

scourgeUnitTail.localizedName = "Scourge Tail";
scourgeUnitTail.create(scourgeSegment);
scourgeUnitTail.weapon = scourgeSegWeap;
scourgeUnitTail.engineSize = 0;
scourgeUnitTail.engineOffset = 0;
scourgeUnitTail.flying = true;
scourgeUnitTail.rotateWeapon = true;
scourgeUnitTail.shootCone = 360;
scourgeUnitTail.health = 32767;
scourgeUnitTail.mass = 11;
scourgeUnitTail.hitsize = segmentOffset / 1.5;
scourgeUnitTail.speed = 0;
scourgeUnitTail.drag = 0.08;
scourgeUnitTail.attackLength = 130;
scourgeUnitTail.range = 150;
scourgeUnitTail.maxVelocity = 4.92;

const scourgeUnitSegment = extendContent(UnitType, "scourge-segment", {
	isHidden(){
		return true;
	}
});

scourgeUnitSegment.localizedName = "Scourge Segment";
scourgeUnitSegment.create(scourgeSegment);
scourgeUnitSegment.weapon = scourgeSegWeap;
scourgeUnitSegment.engineSize = 0;
scourgeUnitSegment.engineOffset = 0;
scourgeUnitSegment.flying = true;
scourgeUnitSegment.rotateWeapon = true;
scourgeUnitSegment.shootCone = 360;
scourgeUnitSegment.health = 32767;
scourgeUnitSegment.mass = 11;
scourgeUnitSegment.hitsize = segmentOffset / 1.5;
scourgeUnitSegment.speed = 0;
scourgeUnitSegment.drag = 0.08;
scourgeUnitSegment.attackLength = 130;
scourgeUnitSegment.range = 150;
scourgeUnitSegment.maxVelocity = 4.92;

const scourgeUnit = extendContent(UnitType, "scourge", {
	displayInfo(table){
		table.table(cons(title => {
			title.addImage(this.icon(Cicon.xlarge)).size(8 * 6);
			title.add("[accent]" + this.localizedName).padLeft(5);
		}));
		
		table.row();
		
		table.addImage().height(3).color(Color.lightGray).pad(15).padLeft(0).padRight(0).fillX();
		
		table.row();
		
		if(this.description != null){
			table.add(this.displayDescription()).padLeft(5).padRight(5).width(400).wrap().fillX();
			table.row();

			table.addImage().height(3).color(Color.lightGray).pad(15).padLeft(0).padRight(0).fillX();
			table.row();
		};
		
		table.left().defaults().fillX();

		table.add(Core.bundle.format("unit.health", this.health));
		table.row();
		table.add(Core.bundle.format("unit.speed", Strings.fixed(this.speed, 1)));
		table.row();
		table.add("Damage Resistance: 90.4%").color(Color.lightGray);
		table.row();
		table.row();
	}
});

scourgeUnit.localizedName = "Scourge of Technology";
scourgeUnit.create(scourgeMain);
scourgeUnit.description = "Prepare to lose Everything.";
scourgeUnit.weapon = scourgeHeadWeap;
scourgeUnit.engineSize = 0;
scourgeUnit.engineOffset = 0;
scourgeUnit.flying = true;
scourgeUnit.health = 32767;
scourgeUnit.mass = 11;
scourgeUnit.hitsize = segmentOffset / 1.5;
scourgeUnit.speed = 0.34;
scourgeUnit.drag = 0.09;
scourgeUnit.attackLength = 170;
scourgeUnit.range = 180;
scourgeUnit.maxVelocity = 4.92;
scourgeUnit.shootCone = 30;
scourgeUnit.rotatespeed = 0.02;
scourgeUnit.baseRotateSpeed = 0.01;

/*const tempFac = extendContent(UnitFactory, "temp-factory", {});

tempFac.unitType = scourgeUnit;*/