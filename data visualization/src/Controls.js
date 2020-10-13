import {
	Quaternion,
	Vector3,
	Raycaster,
	Vector2
} from "../node_modules/three/build/three.module.js";

import {clearSphere,
	  	clearLine,
	   	changeCurrentSphereName,
		clearCurrentSphereName,
		paintSphere,
		paintLine,
		getSelectedLines} from './graph.js';

import {openLinkInBrowser,
		getLinkerSpheres,
		getLinkSpheres} from './dataProcessing.js';

var Controls = function ( object, domElement ) {

	if ( domElement === undefined ) {
		
		console.warn( 'Controls: The second parameter "domElement" is now mandatory.' );
		domElement = document;

	}

	this.object = object;
	this.domElement = domElement;

	if ( domElement ) this.domElement.setAttribute( 'tabindex', - 1 );
	
	// API

	this.SELECTED_COLOR = '#f74646';
	this.LINKER_COLOR = '#34f96d';
	this.LINK_COLOR = '#f9346d';
	this.AUTHORS_COLOR = '#9946f7';
	this.LONELY_PAINT_COLOR = '#ca0909';
	this.paintLineOpacity = 0.9;

	this.raycaster = new Raycaster();
	this.mouse = new Vector2();
	this.selectedSphere = null;
	this.selectedSphereColor = null;

	this.currentMovementSpeedMultiplier = 1.0; 
	this.movementSpeedMultiplier = 5;

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;	

	this.dragToLook = false;
	this.autoForward = false;

	//canvas
	this.isMouseInCanvas = true;
	this.isSearchInFocus = false;

	//painted objs
	this.paintedLinkerSpheres = [];	
	this.paintedLinkerLines = [];

	this.paintedLinkSpheres = [];	
	this.paintedLinkLines = [];

	this.paintedLonelySpheres = [];

	this.paintedSphresByAuthors = [];

	// this.isToolbarShow = false;

	// disable default target object behavior

	// internals

	this.tmpQuaternion = new Quaternion();

	this.isMouseHold = false;

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new Vector3( 0, 0, 0 );
	this.rotationVector = new Vector3( 0, 0, 0 );

	this.keydown = function ( event ) {

		if ( event.altKey) {

			return;

		}

		
		switch ( event.keyCode ) {
			case 13: /*Enter*/  document.getElementById('showBtn').onclick(); break;
		}

		if (!this.isSearchInFocus) {

			//event.preventDefault();

			switch ( event.keyCode ) {

				case 16: /* shift */ this.currentMovementSpeedMultiplier = this.movementSpeedMultiplier; break;

				case 87: /*W*/ this.moveState.forward = 1; this.hideCursor(); break;
				case 83: /*S*/ this.moveState.back = 1; this.hideCursor(); break;

				case 65: /*A*/ this.moveState.left = 1; this.hideCursor(); break;
				case 68: /*D*/ this.moveState.right = 1; this.hideCursor(); break;

				case 82: /*R*/ this.moveState.up = 1; this.hideCursor(); break;
				case 70: /*F*/ this.moveState.down = 1; this.hideCursor(); break;

				case 38: /*up*/ this.moveState.pitchUp = 1; this.hideCursor(); break;
				case 40: /*down*/ this.moveState.pitchDown = 1; this.hideCursor(); break;

				case 37: /*left*/ this.moveState.yawLeft = 1; this.hideCursor(); break;
				case 39: /*right*/ this.moveState.yawRight = 1; this.hideCursor(); break;

				case 81: /*Q*/ this.moveState.rollLeft = 1; this.hideCursor(); break;
				case 69: /*E*/ this.moveState.rollRight = 1; this.hideCursor(); break;
				
				case 32: /*SPACE*/ this.paintLonelySphere(); break;
				case 90: /*Z*/ this.paintLinkerLines(); break;
				case 88: /*X*/ this.paintLinkLines(); break;

				case 67: /*C*/ this.clearAllPainted(); break;

				case 76: /*L*/ this.openPaperLink(); break;
				
			}	

			this.updateMovementVector();
			this.updateRotationVector();	

		}
	};

	this.keyup = function ( event ) {

		//pointerControls.unlock();

		switch ( event.keyCode ) {

			case 16: /* shift */ this.currentMovementSpeedMultiplier = 1; break;

			case 87: /*W*/ this.moveState.forward = 0; break;
			case 83: /*S*/ this.moveState.back = 0; break;

			case 65: /*A*/ this.moveState.left = 0; break;
			case 68: /*D*/ this.moveState.right = 0; break;

			case 82: /*R*/ this.moveState.up = 0; break;
			case 70: /*F*/ this.moveState.down = 0; break;

			case 38: /*up*/ this.moveState.pitchUp = 0; break;
			case 40: /*down*/ this.moveState.pitchDown = 0; break;

			case 37: /*left*/ this.moveState.yawLeft = 0; break;
			case 39: /*right*/ this.moveState.yawRight = 0; break;

			case 81: /*Q*/ this.moveState.rollLeft = 0; break;
			case 69: /*E*/ this.moveState.rollRight = 0; break;
	
		}

		this.updateMovementVector();
		this.updateRotationVector();

		if (!this.isMouseHold){
			this.showCursor();
		}
	};

	this.mousedown = function ( event ) {

		this.hideCursor();


		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();	

		if ( this.dragToLook ) {

			this.isMouseHold = true;

		} else {

			switch ( event.button ) {

				case 0: this.moveState.forward = 1; break;
				case 2: this.moveState.back = 1; break;

			}

			this.updateMovementVector();

		}

	};

	this.mousemove = function ( event ) {		

		if ( ! this.dragToLook || this.isMouseHold ) {

			var container = this.getContainerDimensions();
			var halfWidth = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth ) / halfWidth;
			this.moveState.pitchDown = ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			this.updateRotationVector();

		}

		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;  

	};

	this.mouseup = function ( event ) {

		this.showCursor();

		event.preventDefault();
		event.stopPropagation();


		if ( this.dragToLook ) {


			this.isMouseHold = false;

			this.moveState.yawLeft = this.moveState.pitchDown = 0;

		} else {

			switch ( event.button ) {

				case 0: this.moveState.forward = 0; break;
				case 2: this.moveState.back = 0; break;

			}

			this.updateMovementVector();

		}		

		this.updateRotationVector();

	};

	this.mouseout = function ( event ) {		
		this.isMouseHold = false;
		this.showCursor();

		this.moveState.yawLeft = this.moveState.pitchDown = 0;
		this.updateRotationVector();
	};


	this.update = function ( delta ) {
		if (this.isMouseInCanvas && !this.isSearchInFocus) {
			var moveMult = delta * this.movementSpeed * this.currentMovementSpeedMultiplier;
			var rotMult = delta * this.rollSpeed;
	
			this.object.translateX( this.moveVector.x * moveMult );
			this.object.translateY( this.moveVector.y * moveMult );
			this.object.translateZ( this.moveVector.z * moveMult );
	
			this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
			this.object.quaternion.multiply( this.tmpQuaternion );
	
			// expose the rotation vector for convenience
			this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );
		}
	};

	this.updateMovementVector = function () {

		var forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

		this.moveVector.x = ( - this.moveState.left + this.moveState.right );
		this.moveVector.y = ( - this.moveState.down + this.moveState.up );
		this.moveVector.z = ( - forward + this.moveState.back );

		//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

	};

	this.updateRotationVector = function () {

		this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
		this.rotationVector.y = ( - this.moveState.yawRight + this.moveState.yawLeft );
		this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

	};

	this.getContainerDimensions = function () {

		if ( this.domElement != document ) {

			return {
				size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
			};

		} else {

			return {
				size: [ window.innerWidth, window.innerHeight ],
				offset: [ 0, 0 ]
			};

		}

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _mousedown, false );
		this.domElement.removeEventListener( 'mousemove', _mousemove, false );
		this.domElement.removeEventListener( 'mouseup', _mouseup, false );

		window.removeEventListener( 'keydown', _keydown, false );
		window.removeEventListener( 'keyup', _keyup, false );

	};

	this.hideCursor = function () {

		//console.log('hide');
		this.domElement.style.cursor = 'none';

	};

	this.showCursor = function () {

		//console.log('show');
		this.domElement.style.cursor = 'auto';

	};

	this.raycasterRender = function(camera, scene) {
		this.raycaster.setFromCamera( this.mouse, camera );
		const intersects = this.raycaster.intersectObjects( scene.children );

		if (intersects.length > 0 &&  intersects != undefined) {
			const notMouseHold = !this.isMouseHold;
			const isObjSphere = intersects[0].object.name[0] == 's';
	
			if (notMouseHold && isObjSphere) {
				changeCurrentSphereName(intersects[0].object.name.slice(2));

				if (this.selectedSphere != intersects[0].object) {
					if (this.selectedSphere != null) {					
						this.unselectPointedSphere(); 
					}
					this.selectSphere(intersects[0].object)
				}				
			}
		} else if (this.selectedSphere != null){
			clearCurrentSphereName();
			this.unselectPointedSphere();
		}	
	}

	this.selectSphere = function (object) {		
		this.selectedSphereColor = object.material.color.getHex(); 
		this.selectedSphere = object;				
		object.material.color.set(this.SELECTED_COLOR);
	}

	this.unselectPointedSphere = function() {
		this.selectedSphere.material.color.set(this.selectedSphereColor);	
		this.clearPointedSphere();
	}

	this.clearPointedSphere = function() {
		this.selectedSphere = null;
		this.selectedSphereColor = null;
	}

	this.getSelectedSphereDOI = function() {
		return this.selectedSphere.name.slice(2);
	}

	this.paintLonelySphere = function() {
		if (this.selectedSphere != null) {
			paintSphere(this.selectedSphere, this.LONELY_PAINT_COLOR);
			this.paintedLonelySpheres.push(this.getSelectedSphereDOI());
			this.clearPointedSphere();
		}
	}

	this.paintSelectedLines = function(sphereDOI, selectLinesArray, paintLineColor, linesArray, spheresArray) {					
		const selectedLines = getSelectedLines(sphereDOI, selectLinesArray);
		for (let line of selectedLines) {
			paintLine(line, paintLineColor, this.paintLineOpacity);
			linesArray.push(line);
		}			

		paintSphere(this.selectedSphere, paintLineColor);
		spheresArray.push(sphereDOI);

		this.clearPointedSphere();
	}

	this.paintLinkerLines = function()  {	
		if (this.selectedSphere != null) {	
			const sphereDOI = this.getSelectedSphereDOI();
			this.paintSelectedLines(
				sphereDOI,
				getLinkerSpheres(sphereDOI),
				this.LINKER_COLOR,
				this.paintedLinkerLines,
				this.paintedLinkerSpheres);
		}
	}

	this.paintLinkLines = function() {
		if (this.selectedSphere != null) {	
			const sphereDOI = this.getSelectedSphereDOI();
			this.paintSelectedLines(
				sphereDOI,
				getLinkSpheres(sphereDOI),
				this.LINK_COLOR,
				this.paintedLinkLines,
				this.paintedLinkSpheres);
		}
	}

	this.clearAllPainted = function() {
		for (let sphereDOI of this.paintedLinkerSpheres) {
			clearSphere(sphereDOI);
		}

		for (let sphereDOI of this.paintedLinkSpheres) {
			clearSphere(sphereDOI);
		}		

		for (let sphereDOI of this.paintedLonelySpheres) {
			clearSphere(sphereDOI);
		}

		if (this.selectedSphere != null) {
			clearSphere(this.getSelectedSphereDOI());
			this.clearPointedSphere();
		}

		for (let line of this.paintedLinkerLines) {
			clearLine(line);
		}

		for (let line of this.paintedLinkLines) {
			clearLine(line);
		}
		
		for (let sphereDOI of this.paintedSphresByAuthors) {
			clearSphere(sphereDOI);
		}
	}

	this.openPaperLink = function() {
		if (this.selectedSphere != null) {	
			openLinkInBrowser(this.getSelectedSphereDOI());
		}	
	}

	this.mouseleave = function() {
		this.isMouseInCanvas = false;
	}

	this.mouseenter = function() {
		this.isMouseInCanvas = true;
	}

	var _mousemove = bind( this, this.mousemove );
	var _mousedown = bind( this, this.mousedown );
	var _mouseup = bind( this, this.mouseup );
	var _mouseout = bind( this, this.mouseout );
	var _keydown = bind( this, this.keydown );
	var _keyup = bind( this, this.keyup );

	const _mouseleave = bind( this, this.mouseleave );
	const _mouseenter = bind( this, this.mouseenter );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );

	this.domElement.addEventListener( 'mousemove', _mousemove, false );
	this.domElement.addEventListener( 'mousedown', _mousedown, false );
	this.domElement.addEventListener( 'mouseup', _mouseup, false );
	this.domElement.addEventListener( 'mouseout', _mouseout, false );

	this.domElement.addEventListener('mouseleave', _mouseleave, false)
	this.domElement.addEventListener('mouseenter', _mouseenter, false)
	

	window.addEventListener( 'keydown', _keydown, false );
	window.addEventListener( 'keyup', _keyup, false );

	this.updateMovementVector();
	this.updateRotationVector();

};


export { Controls };
