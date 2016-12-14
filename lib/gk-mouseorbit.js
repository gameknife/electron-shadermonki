/**
 * Created by kaimingyi on 12/11/2016.
 */
'use strict'
var mouseorbit = mouseorbit || {};

module.exports = mouseorbit;

mouseorbit.HOLDLEFT = 1;
mouseorbit.HOLDMIDDLE = 2;
mouseorbit.HOLDRIGHT = 3;
mouseorbit.HOLDFREE = 0;

mouseorbit.frame = null;
mouseorbit.startPT = null;
mouseorbit.movePT = null;
mouseorbit.delta = { x: 0, y: 0};

mouseorbit.deltaLast = { x: 0, y: 0, z: 0};

mouseorbit.wheelStatus = 0;
mouseorbit._wheelStatus = 0;

mouseorbit.moveType = 0;

mouseorbit.frameUpdate = function()
{
    let relativeDelta = { x: mouseorbit.delta.x - mouseorbit.deltaLast.x, y : mouseorbit.delta.y - mouseorbit.deltaLast.y, z: mouseorbit.wheelStatus };
    mouseorbit.deltaLast = mouseorbit.delta;
    mouseorbit.wheelStatus = 0;
    return relativeDelta;
}

mouseorbit.updateDelta = function()
{
    mouseorbit.delta = { x: mouseorbit.movePT.x - mouseorbit.startPT.x, y: mouseorbit.movePT.y - mouseorbit.startPT.y};
}

mouseorbit.onMouseDown = function( event )
{
    event.preventDefault();

    mouseorbit.startPT = { x: event.clientX, y: event.clientY};

    if ('which' in event) {
        switch (event.which) {
            case 1:
                mouseorbit.moveType = mouseorbit.HOLDLEFT;
                break;
            case 2:
                mouseorbit.moveType = mouseorbit.HOLDMIDDLE;
                break;
            case 3:
                mouseorbit.moveType = mouseorbit.HOLDRIGHT;
                break;
        }
    }

    mouseorbit.frame.addEventListener( 'mousemove', mouseorbit.onMouseMove, false );
    mouseorbit.frame.addEventListener( 'mouseup', mouseorbit.onMouseUp, false );

    mouseorbit.delta = { x: 0, y: 0};
    mouseorbit.deltaLast = { x: 0, y: 0};
}

mouseorbit.onMouseMove = function( event )
{
    mouseorbit.frame.style.setProperty( 'cursor', 'move' );

    event.preventDefault();

    mouseorbit.movePT = { x: event.clientX, y: event.clientY};

    mouseorbit.updateDelta();
}

mouseorbit.onMouseUp = function( event )
{
    mouseorbit.frame.style.setProperty( 'cursor', 'pointer' );

    mouseorbit.moveType = mouseorbit.HOLDFREE;

    mouseorbit.frame.removeEventListener( 'mousemove', mouseorbit.onMouseMove, false);
    mouseorbit.frame.removeEventListener( 'mouseup', mouseorbit.onMouseUp, false);
}

mouseorbit.onMouseWheel = function( event ) {

    var value = event.wheelDelta || -event.detail;
    var delta = Math.max(-1, Math.min(1, value));
    mouseorbit.wheelStatus = delta;
}

mouseorbit.init = function( frame )
{
    mouseorbit.frame = frame;
    mouseorbit.frame.addEventListener( 'mousedown', mouseorbit.onMouseDown, false );
    mouseorbit.frame.addEventListener( 'mousewheel', mouseorbit.onMouseWheel, false );
}