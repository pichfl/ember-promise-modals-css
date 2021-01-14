import { A } from '@ember/array';
import { set } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service from '@ember/service';

import Modal from '../modal';

export default Service.extend({
  count: alias('_stack.length'),
  top: alias('_stack.lastObject'),

  focusTrapOptions: null,
  outAnimationTimeout: 200,

  init() {
    this._super(...arguments);
    set(this, '_stack', A([]));

    this.focusTrapOptions = this.focusTrapOptions || {
      clickOutsideDeactivates: true,
    };

    let outAnimationTimeout = this.outAnimationTimeout;
    let mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let mediaQueryCallback = () => {
      set(this, 'outAnimationTimeout', this._matchMedia.matches ? 0 : outAnimationTimeout);
    };

    mediaQuery.addListener(mediaQueryCallback);
    this._matchMedia = mediaQuery;

    mediaQueryCallback();
  },

  willDestroy() {
    this._onLastModalRemoved();
  },

  open(name, data, options) {
    let modal = new Modal(this, name, data, options);

    this._stack.pushObject(modal);

    if (this._stack.length === 1) {
      this._onFirstModalAdded();
    }

    return modal;
  },

  _onFirstModalAdded() {
    document.body.classList.add('epm-scrolling-disabled');
  },

  _onLastModalRemoved() {
    document.body.classList.remove('epm-scrolling-disabled');
  },

  _onModalAnimationStart() {
    document.body.classList.add('epm-animating');
  },

  _onModalAnimationEnd() {
    document.body.classList.remove('epm-animating');
  },
});
