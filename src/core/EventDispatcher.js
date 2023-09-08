/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

class Event {

	path = null;

	constructor( eventData, options ) {

		Object.assign( this, eventData );

		if ( ( options && ! options.bubbles ) || ! options ) {

			this.isBubblingStopped = true;

		}

	}

	stopQueue() {

		this.isQueueStopped = true;

	}

	stopBubbling() {

		this.isBubblingStopped = true;

	}

}

class EventDispatcher {

	listeners = new Map();

	addEventListener( type, callback, options ) {

		const typedListeners = this.listeners.get( type ) || [];
		const priority = options?.priority || 0;

		const existingListener = typedListeners.findIndex( ( listener ) => listener.callback === callback );

		if ( existingListener === - 1 ) {

			typedListeners.push( { priority, callback } );
			typedListeners.sort( ( listenerA, listenerB ) => listenerB.priority - listenerA.priority );

		}

		this.listeners.set( type, typedListeners );

	}

	hasEventListener( type, callback ) {

		const typedListeners = this.listeners.get( type );
		if ( ! typedListeners ) return false;

		return typedListeners.findIndex( ( listener ) => listener.callback === callback ) !== - 1;

	}

	removeEventListener( type, callback ) {

		const typedListeners = this.listeners.get( type );
		if ( typedListeners === undefined ) return;

		const index = typedListeners.findIndex( ( listener ) => listener.callback === callback );

		if ( index !== - 1 ) {

			typedListeners.splice( index, 1 );

		}

	}

	dispatchEvent( event ) {

		let typedListeners = this.listeners.get( event.type ) || [];

		if ( ! event.target ) event.target = this;

		if ( ! event.path ) {

			const path = [];
			let current = this;
			while ( current.parent ) {

				path.push( current.parent );
				current = current.parent;

			}

			event.path = path;

		}

		// Make a copy, in case listeners are removed while iterating.
		typedListeners = typedListeners.slice( 0 );

		for ( let i = 0, l = typedListeners.length; i < l; i ++ ) {

			if ( event.isQueueStopped ) {

				event.isQueueStopped = false;
				break;

			}

			typedListeners[ i ].callback.call( this, event );

		}

		if ( event.path.length && ! event.isBubblingStopped ) {

			event.path.pop().dispatchEvent( event );

		}

	}

}

export { Event, EventDispatcher };
