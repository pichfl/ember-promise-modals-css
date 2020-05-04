import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import Service from '@ember/service';

import Modal from '../modal';

export default Service.extend({
  count: alias('_stack.length'),
  top: alias('_stack.lastObject'),

  focusTrapOptions: null,

  init() {
    this._super(...arguments);
    this._stack = A([]);

    this.focusTrapOptions = this.focusTrapOptions || {
      clickOutsideDeactivates: true,
    };
  },

  willDestroy() {
    this._onLastModalRemoved();
  },

  open(name, data) {
    let modal = new Modal(this, name, data);

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
});
