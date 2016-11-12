/**
 * Created by kaimingyi on 12/11/2016.
 */
'use strict'
var mouseorbit = mouseorbit || {};

module.exports = mouseorbit;

mouseorbit.frame = null;
mouseorbit.startPT = null;
mouseorbit.movePT = null;
mouseorbit.delta = { x: 0, y: 0};

mouseorbit.deltaLast = { x: 0, y: 0};

mouseorbit.frameUpdate = function()
{
    var relativeDelta = { x: mouseorbit.delta.x - mouseorbit.deltaLast.x, y : mouseorbit.delta.y - mouseorbit.deltaLast.y };
    mouseorbit.deltaLast = mouseorbit.delta;
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

    mouseorbit.frame.removeEventListener( 'mousemove', mouseorbit.onMouseMove, false);
    mouseorbit.frame.removeEventListener( 'mouseup', mouseorbit.onMouseUp, false);
}

mouseorbit.init = function( frame )
{
    mouseorbit.frame = frame;
    mouseorbit.frame.addEventListener( 'mousedown', mouseorbit.onMouseDown, false );
}